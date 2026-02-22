import { ReactNode } from 'react';
import './ContentTable.css';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
  hideOnMobile?: boolean; // New: hide column on mobile
}

interface ContentTableProps {
  columns: Column[];
  data: any[];
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onRowClick?: (row: any) => void;
  onSelectRow?: (row: any, selected: boolean) => void;
  selectedRows?: Set<any>;
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  error?: string; // New: error message
  onRetry?: () => void; // New: retry handler
  emptyIcon?: ReactNode; // New: custom empty state icon
  emptyAction?: ReactNode; // New: custom empty state action
  stickyHeader?: boolean; // New: sticky header for long tables
}

export default function ContentTable({
  columns,
  data,
  onSort,
  sortKey,
  sortOrder = 'desc',
  onRowClick,
  onSelectRow,
  selectedRows = new Set(),
  selectable = false,
  loading = false,
  emptyMessage = 'No data available',
  error,
  onRetry,
  emptyIcon,
  emptyAction,
  stickyHeader = false
}: ContentTableProps) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const newOrder = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectRow) return;
    data.forEach(row => {
      onSelectRow(row, e.target.checked);
    });
  };

  const allSelected = data.length > 0 && data.every(row => selectedRows.has(row.id));

  // Error state
  if (error) {
    return (
      <div className="content-table-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Loading state with improved skeleton
  if (loading) {
    return (
      <div className="content-table-wrapper">
        <table className="content-table">
          <thead>
            <tr>
              {selectable && <th className="col-checkbox"></th>}
              {columns.map(column => (
                <th key={column.key} className={column.hideOnMobile ? 'hide-mobile' : ''}>
                  <div className="skeleton skeleton-text"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                {selectable && (
                  <td className="col-checkbox">
                    <div className="skeleton skeleton-checkbox"></div>
                  </td>
                )}
                {columns.map(column => (
                  <td key={column.key} className={column.hideOnMobile ? 'hide-mobile' : ''}>
                    <div className="skeleton skeleton-text"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state with icon and action
  if (data.length === 0) {
    return (
      <div className="content-table-empty">
        {emptyIcon && <div className="empty-icon">{emptyIcon}</div>}
        {!emptyIcon && <div className="empty-icon-default">📋</div>}
        <h3>No Data Found</h3>
        <p>{emptyMessage}</p>
        {emptyAction && <div className="empty-action">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="content-table-wrapper">
      <table className={`content-table ${stickyHeader ? 'sticky-header' : ''}`}>
        <thead>
          <tr>
            {selectable && (
              <th className="col-checkbox">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                className={`${column.sortable ? 'sortable' : ''} ${column.hideOnMobile ? 'hide-mobile' : ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="th-content">
                  <span>{column.label}</span>
                  {column.sortable && sortKey === column.key && (
                    <span className="sort-icon">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              className={`${onRowClick ? 'clickable' : ''} ${selectedRows.has(row.id) ? 'selected' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {selectable && (
                <td className="col-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={(e) => onSelectRow && onSelectRow(row, e.target.checked)}
                    aria-label={`Select row ${index + 1}`}
                  />
                </td>
              )}
              {columns.map(column => (
                <td key={column.key} className={column.hideOnMobile ? 'hide-mobile' : ''}>
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
