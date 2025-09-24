/**
 * @typedef {Object} Product
 * @property {string} mbid - MusicBrainz ID
 * @property {string} title - Release title
 * @property {string} artist - Artist name
 * @property {string} date - Release date (YYYY-MM-DD)
 * @property {string} country - Country code
 * @property {string} label - Record label
 * @property {string} catno - Catalog number
 * @property {string} barcode - Barcode/UPC
 * @property {string} cover - Cover art URL
 * @property {Array<{position: string, title: string, length: string}>} tracks - Track listing
 * @property {string} format - Physical format (CD, Vinyl, etc.)
 * @property {Array<string>} genres - Music genres
 * @property {Array<string>} styles - Music styles
 */

/**
 * Convert milliseconds to duration string (MM:SS)
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
export function msToDurationString(ms) {
  if (!ms || ms === 0) return '';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Search MusicBrainz for release by barcode or artist+title
 * @param {Object} params - Search parameters
 * @param {string} params.artist - Artist name
 * @param {string} params.title - Release title
 * @param {string} params.barcode - Barcode (optional)
 * @returns {Promise<string|null>} MusicBrainz ID or null
 */
async function searchMusicBrainz({ artist, title, barcode }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    let query;
    if (barcode) {
      query = `barcode:${barcode}`;
    } else {
      query = `artist:"${artist}" AND release:"${title}"`;
    }

    const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=1`;
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FromDeepestRecord/1.0.0 (contact@fromdeepestrecord.com)'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.releases || data.releases.length === 0) return null;

    return data.releases[0].id;
  } catch (error) {
    console.warn('MusicBrainz search failed:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get detailed release information from MusicBrainz
 * @param {string} mbid - MusicBrainz ID
 * @returns {Promise<Object|null>} Release details or null
 */
async function getMusicBrainzDetails(mbid) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://musicbrainz.org/ws/2/release/${mbid}?inc=recordings+labels&fmt=json`;
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FromDeepestRecord/1.0.0 (contact@fromdeepestrecord.com)'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('MusicBrainz details failed:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get cover art from Cover Art Archive
 * @param {string} mbid - MusicBrainz ID
 * @returns {Promise<string|null>} Cover art URL or null
 */
async function getCoverArt(mbid) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://coverartarchive.org/release/${mbid}`;
    
    const response = await fetch(url, {
      signal: controller.signal
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.images || data.images.length === 0) return null;

    // Try to find front cover, otherwise use first image
    const frontCover = data.images.find(img => img.front === true);
    const coverImage = frontCover || data.images[0];

    return coverImage.image || null;
  } catch (error) {
    console.warn('Cover Art Archive failed:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Search Discogs for additional metadata (optional)
 * @param {string} artist - Artist name
 * @param {string} title - Release title
 * @returns {Promise<Object|null>} Discogs data or null
 */
async function searchDiscogs(artist, title) {
  const token = import.meta.env.VITE_DISCOGS_TOKEN;
  if (!token) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const query = `${artist} ${title}`;
    const url = `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&token=${token}`;
    
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FromDeepestRecord/1.0.0'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;

    const result = data.results[0];
    return {
      format: result.format ? result.format.join(', ') : null,
      genres: result.genre || [],
      styles: result.style || []
    };
  } catch (error) {
    console.warn('Discogs search failed:', error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Enrich release metadata from multiple sources
 * @param {Object} params - Release parameters
 * @param {string} params.artist - Artist name
 * @param {string} params.title - Release title
 * @param {string} params.barcode - Barcode (optional)
 * @returns {Promise<Product|null>} Enriched product data or null
 */
export async function enrichRelease({ artist, title, barcode }) {
  try {
    // Step 1: Search MusicBrainz
    const mbid = await searchMusicBrainz({ artist, title, barcode });
    if (!mbid) return null;

    // Step 2: Get detailed information
    const details = await getMusicBrainzDetails(mbid);
    if (!details) return null;

    // Step 3: Get cover art
    const cover = await getCoverArt(mbid);

    // Step 4: Get Discogs data (optional)
    const discogsData = await searchDiscogs(artist, title);

    // Step 5: Normalize and return data
    const tracks = [];
    if (details.media && details.media[0] && details.media[0].tracks) {
      details.media[0].tracks.forEach(track => {
        tracks.push({
          position: track.position || '',
          title: track.title || '',
          length: track.length ? msToDurationString(track.length) : ''
        });
      });
    }

    const label = details['label-info'] && details['label-info'][0] 
      ? details['label-info'][0].label.name 
      : '';

    const catno = details['label-info'] && details['label-info'][0] 
      ? details['label-info'][0]['catalog-number'] 
      : '';

    return {
      mbid,
      title: details.title || title,
      artist: details['artist-credit'] && details['artist-credit'][0] 
        ? details['artist-credit'][0].name 
        : artist,
      date: details.date || '',
      country: details.country || '',
      label,
      catno,
      barcode: details.barcode || barcode || '',
      cover,
      tracks,
      format: discogsData?.format || '',
      genres: discogsData?.genres || [],
      styles: discogsData?.styles || []
    };
  } catch (error) {
    console.error('Release enrichment failed:', error);
    return null;
  }
}