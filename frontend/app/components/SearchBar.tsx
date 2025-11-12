"use client";

import { useState, KeyboardEvent } from "react";
import "./SearchBar.css";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");

  // Gère la touche "Entrée"
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <div className="searchbar">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ex: Pizza, Sushi, Burger..."
          className="search-input"
        />
      </div>
      <button 
        onClick={handleSearch} 
        className="search-button"
        disabled={!value.trim()}
      >
        Rechercher
      </button>
    </div>
  );
}
