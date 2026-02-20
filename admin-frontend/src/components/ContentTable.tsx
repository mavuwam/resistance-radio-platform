import { ReactNode } from 'react';
import './ContentTable.css';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
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
  emptyMessage = 'No data available'
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

  if (loading) {
    return (
      <div className="content-table-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="content-table-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="content-table-wrapper">
      <table className="content-table">
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
                className={column.sortable ? 'sortable' : ''}
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
                <td key={column.key}>
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
