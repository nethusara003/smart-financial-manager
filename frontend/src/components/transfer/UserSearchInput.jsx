import React, { useState, useEffect, useRef } from "react";
import { Search, User, X, Loader } from "lucide-react";
import { useTransferUserSearch } from "../../hooks/useTransfers";

const UserSearchInput = ({ onSelectUser, selectedUser }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef(null);
  const dropdownRef = useRef(null);

  const {
    data: results = [],
    isFetching: loading,
  } = useTransferUserSearch(debouncedQuery, {
    enabled: debouncedQuery.length >= 2,
  });

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length >= 2) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        setDebouncedQuery(query);
        setShowDropdown(true);
      }, 300);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleQueryChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (nextQuery.length < 2) {
      setDebouncedQuery("");
      setShowDropdown(false);
    }
  };

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setQuery("");
    setDebouncedQuery("");
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    onSelectUser(null);
    setQuery("");
    setDebouncedQuery("");
    setShowDropdown(false);
  };

  if (selectedUser) {
    return (
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white">
              {selectedUser.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedUser.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleClearSelection}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search by email, username, or name..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-dark-border-default rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent bg-white dark:bg-dark-bg-secondary text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {loading && (
          <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-lg dark:shadow-elevated-dark max-h-64 overflow-y-auto">
          {results.map((user) => (
            <button
              key={user.userId}
              onClick={() => handleSelectUser(user)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-dark-surface-hover transition-colors border-b border-gray-100 dark:border-dark-border-subtle last:border-0"
            >
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  {user.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface-elevated border border-gray-200 dark:border-dark-border-default rounded-lg shadow-lg p-4 text-center">
          <p className="text-gray-600 dark:text-gray-400">No users found</p>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
