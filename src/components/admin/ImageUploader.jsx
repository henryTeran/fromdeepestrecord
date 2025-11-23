import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const ImageUploader = ({
  value,
  onChange,
  multiple = false,
  label = "Upload Image",
  maxFiles = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const currentImages = Array.isArray(value) ? value : (value ? [value] : []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
        const uploadPromises = files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image`);
        }

        const timestamp = Date.now();
        const path = `releases/${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const result = await adminApi.storage.uploadFile(file, path);
        // result can be either a string (legacy) or an object { url, publicUrl }
        if (typeof result === 'string') return result;
        return result.url || result.publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (multiple) {
        const newUrls = [...currentImages, ...uploadedUrls].slice(0, maxFiles);
        onChange(newUrls);
      } else {
        onChange(uploadedUrls[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (urlToRemove) => {
    if (multiple) {
      const filtered = currentImages.filter(url => url !== urlToRemove);
      onChange(filtered);
    } else {
      onChange('');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        {multiple && currentImages.length > 0 && (
          <span className="text-sm text-gray-400">
            {currentImages.length} / {maxFiles} images
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {currentImages.map((url, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={url}
              alt={`Upload ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => handleRemove(url)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {(multiple ? currentImages.length < maxFiles : currentImages.length === 0) && (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-zinc-700 rounded-lg hover:border-red-600 transition-colors flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm">Upload</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUploader;
