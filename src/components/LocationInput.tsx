import React, { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { geocodeAddress } from '../utils/geocoding';

interface LocationInputProps {
  value: string;
  onChange: (location: string, coordinates?: [number, number]) => void;
  placeholder?: string;
}

export function LocationInput({ value, onChange, placeholder = "Enter a location..." }: LocationInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!value.trim()) return;
    
    setIsLoading(true);
    try {
      const coordinates = await geocodeAddress(value);
      onChange(value, coordinates || undefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading || !value.trim()}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}