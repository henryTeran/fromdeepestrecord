import { useState, useEffect, useRef } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, ChevronDown } from 'lucide-react';

const AutocompleteSelect = ({
  value,
  onChange,
  collection: collectionName,
  label,
  placeholder = "Search...",
  displayField = "name",
  required = false
}) => {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (value && !selectedItem) {
      fetchSelectedItem();
    }
  }, [value]);

  useEffect(() => {
    if (search.length >= 2) {
      searchOptions();
    } else {
      setOptions([]);
    }
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSelectedItem = async () => {
    try {
      const colRef = collection(db, collectionName);
      const q = query(colRef, where('__name__', '==', value), limit(1));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setSelectedItem({ id: doc.id, ...doc.data() });
      }
    } catch (err) {
      console.error('Error fetching selected item:', err);
    }
  };

  const searchOptions = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, collectionName);
      const searchLower = search.toLowerCase();

      const q = query(colRef, limit(20));
      const snapshot = await getDocs(q);

      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item =>
          item[displayField]?.toLowerCase().includes(searchLower)
        )
        .slice(0, 10);

      setOptions(results);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedItem(item);
    onChange(item.id);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelectedItem(null);
    onChange('');
    setSearch('');
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {selectedItem ? (
        <div className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between">
          <span className="text-white">{selectedItem[displayField]}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-zinc-800 rounded-lg border border-zinc-700 max-h-64 overflow-y-auto shadow-xl">
              {loading ? (
                <div className="p-4 text-center text-gray-400">Loading...</div>
              ) : options.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  {search.length < 2 ? 'Type to search...' : 'No results found'}
                </div>
              ) : (
                options.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors text-white border-b border-zinc-700 last:border-0"
                  >
                    {item[displayField]}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteSelect;
