import { useState, useEffect, useRef } from 'react';
import './EmailFilters.css';

interface EmailFiltersProps {
  statusFilter: 'all' | 'unread' | 'read' | 'archived';
  searchQuery: string;
  onStatusFilterChange: (status: 'all' | 'unread' | 'read' | 'archived') => void;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
}

export default function EmailFilters({
  statusFilter,
  searchQuery,
  onStatusFilterChange,
  onSearchChange,
  onSearchSubmit
}: EmailFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Handle search input change with debouncing
  const handleSearchInputChange = (value: string) => {
    setLocalSearchQuery(value);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debouncing (500ms delay)
    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 500);
  };

  // Handle search submit (Enter key or button click)
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Immediately trigger search
    onSearchChange(localSearchQuery);
    onSearchSubmit();
  };

  // Handle clear search
  const handleClearSearch = () => {
    setLocalSearchQuery('');
    
    // Clear debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Immediately clear search
    onSearchChange('');
    onSearchSubmit();
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="email-filters">
      {/* Status Filter Dropdown */}
      <div className="filter-group">
        <label htmlFor="status-filter" className="filter-label">
          Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className={`status-filter-select ${statusFilter !== 'all' ? 'active' : ''}`}
          aria-label="Filter emails by status"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="search-group">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={localSearchQuery}
            onChange={(e) => handleSearchInputChange(e.target.value)}
            placeholder="Search emails..."
            className="search-input"
            aria-label="Search emails"
          />
          
          {/* Clear Button */}
          {localSearchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="clear-button"
              aria-label="Clear search"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="search-button"
          aria-label="Search"
          title="Search"
        >
          🔍
        </button>
      </form>
    </div>
  );
}
