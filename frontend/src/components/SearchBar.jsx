import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ products = [] }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Input change par live search suggestions filter karna
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim() === '') {
      setSuggestions([]);
    } else {
      // Products list me se title ya category match karna
      const filtered = products.filter(p => 
        p.title.toLowerCase().includes(value.toLowerCase()) ||
        p.category?.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5)); // Sirf top 5 suggestions dikhayein
    }
  };

  // Search button press ya Enter karne par
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Searching for:", query);
      setSuggestions([]);
      // Agar aap search results page par navigate karna chahein:
      // navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  // Kisi suggestion par click karne par product details page par jana
  const handleSelectProduct = (productId) => {
    setQuery('');
    setSuggestions([]);
    navigate(`/product/${productId}`);
  };

  return (
    <div className="relative flex-1 max-w-xl">
      <form onSubmit={handleSearchSubmit} className="flex items-center">
        <input
          type="text"
          placeholder="Search in NexuStore (e.g., Mobiles, Fashion)..."
          value={query}
          onChange={handleInputChange}
          className="w-full py-2 px-4 rounded-l bg-white text-gray-800 focus:outline-none shadow-inner text-sm border border-r-0 border-gray-300"
        />
        <button 
          type="submit"
          className="bg-orange-600 text-white px-5 py-2 rounded-r hover:bg-orange-700 transition flex items-center justify-center font-medium"
        >
          🔍
        </button>
      </form>

      {/* Live Auto-complete Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {suggestions.map((product) => (
            <div
              key={product._id}
              onClick={() => handleSelectProduct(product._id)}
              className="px-4 py-2.5 hover:bg-orange-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-none transition"
            >
              <img 
                src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                alt={product.title} 
                className="w-10 h-10 object-contain rounded bg-gray-50 border p-0.5"
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800 line-clamp-1">{product.title}</h4>
                <span className="text-xs text-orange-600 font-bold">
                  Rs. {product.discountPrice || product.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;