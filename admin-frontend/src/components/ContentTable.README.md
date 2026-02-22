# ContentTable Component

A flexible, feature-rich table component for displaying and managing content in the admin portal.

## Features

- ✅ **Error Handling**: Display error messages with retry functionality
- ✅ **Loading States**: Skeleton loaders that match table structure
- ✅ **Empty States**: Customizable empty state with icons and actions
- ✅ **Sticky Headers**: Keep headers visible while scrolling long tables
- ✅ **Responsive Design**: Hide non-essential columns on mobile devices
- ✅ **Sorting**: Click column headers to sort data
- ✅ **Row Selection**: Select individual rows or all rows with checkboxes
- ✅ **Hover Effects**: Visual feedback on interactive elements

## Props

### Column Interface

```typescript
interface Column {
  key: string;              // Unique identifier for the column
  label: string;            // Display label for column header
  sortable?: boolean;       // Enable sorting for this column
  hideOnMobile?: boolean;   // Hide column on screens < 640px
  render?: (value: any, row: any) => ReactNode;  // Custom cell renderer
}
```

### ContentTableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | Required | Array of column definitions |
| `data` | `any[]` | Required | Array of data rows to display |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `error` | `string` | `undefined` | Error message to display |
| `onRetry` | `() => void` | `undefined` | Callback for retry button |
| `emptyMessage` | `string` | `'No data available'` | Message for empty state |
| `emptyIcon` | `ReactNode` | `📋` | Custom icon for empty state |
| `emptyAction` | `ReactNode` | `undefined` | Custom action button for empty state |
| `stickyHeader` | `boolean` | `false` | Enable sticky table header |
| `sortKey` | `string` | `undefined` | Currently sorted column key |
| `sortOrder` | `'asc' \| 'desc'` | `'desc'` | Current sort order |
| `onSort` | `(key: string, order: 'asc' \| 'desc') => void` | `undefined` | Sort callback |
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectedRows` | `Set<any>` | `new Set()` | Set of selected row IDs |
| `onSelectRow` | `(row: any, selected: boolean) => void` | `undefined` | Row selection callback |
| `onRowClick` | `(row: any) => void` | `undefined` | Row click callback |

## Usage Examples

### Basic Table

```tsx
import ContentTable from '../components/ContentTable';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' }
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Editor' }
];

<ContentTable columns={columns} data={data} />
```

### With Error Handling

```tsx
const [error, setError] = useState<string | null>(null);

const handleRetry = () => {
  setError(null);
  fetchData();
};

<ContentTable
  columns={columns}
  data={data}
  error={error}
  onRetry={handleRetry}
/>
```

### With Loading State

```tsx
const [loading, setLoading] = useState(true);

<ContentTable
  columns={columns}
  data={data}
  loading={loading}
/>
```

### With Custom Empty State

```tsx
<ContentTable
  columns={columns}
  data={data}
  emptyMessage="No shows found. Create your first show to get started."
  emptyIcon={<span style={{ fontSize: '4rem' }}>🎙️</span>}
  emptyAction={
    <button onClick={handleCreate} className="btn-primary">
      Create Show
    </button>
  }
/>
```

### With Sticky Header

```tsx
<ContentTable
  columns={columns}
  data={data}
  stickyHeader={true}
/>
```

### With Responsive Columns

```tsx
const columns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', hideOnMobile: true },
  { key: 'date', label: 'Date', hideOnMobile: true },
  { key: 'status', label: 'Status' }
];

<ContentTable columns={columns} data={data} />
```

### With Sorting

```tsx
const [sortKey, setSortKey] = useState('name');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

const handleSort = (key: string, order: 'asc' | 'desc') => {
  setSortKey(key);
  setSortOrder(order);
  // Sort your data here
};

<ContentTable
  columns={columns}
  data={data}
  sortKey={sortKey}
  sortOrder={sortOrder}
  onSort={handleSort}
/>
```

### With Row Selection

```tsx
const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

const handleSelectRow = (row: any, selected: boolean) => {
  const newSelected = new Set(selectedRows);
  if (selected) {
    newSelected.add(row.id);
  } else {
    newSelected.delete(row.id);
  }
  setSelectedRows(newSelected);
};

<ContentTable
  columns={columns}
  data={data}
  selectable={true}
  selectedRows={selectedRows}
  onSelectRow={handleSelectRow}
/>
```

### With Custom Cell Rendering

```tsx
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { 
    key: 'status', 
    label: 'Status',
    render: (value: string) => (
      <span className={`status-badge status-${value.toLowerCase()}`}>
        {value}
      </span>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <div className="action-buttons">
        <button onClick={() => handleEdit(row)}>Edit</button>
        <button onClick={() => handleDelete(row)}>Delete</button>
      </div>
    )
  }
];

<ContentTable columns={columns} data={data} />
```

### Complete Example with All Features

```tsx
import { useState, useEffect } from 'react';
import ContentTable from '../components/ContentTable';
import { useToast } from '../utils/toast';

function ShowsManagement() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const { addToast } = useToast();

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'host', label: 'Host', sortable: true, hideOnMobile: true },
    { key: 'category', label: 'Category', hideOnMobile: true },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`status-${value}`}>{value}</span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button onClick={() => handleEdit(row)}>Edit</button>
      )
    }
  ];

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getShows();
      setShows(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shows');
      addToast('error', 'Failed to load shows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortKey(key);
    setSortOrder(order);
    // Sort logic here
  };

  const handleSelectRow = (row: any, selected: boolean) => {
    const newSelected = new Set(selectedRows);
    if (selected) {
      newSelected.add(row.id);
    } else {
      newSelected.delete(row.id);
    }
    setSelectedRows(newSelected);
  };

  const handleRowClick = (row: any) => {
    // Open edit modal
  };

  const handleCreate = () => {
    // Open create modal
  };

  return (
    <div>
      <ContentTable
        columns={columns}
        data={shows}
        loading={loading}
        error={error}
        onRetry={fetchShows}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        selectable={true}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onRowClick={handleRowClick}
        stickyHeader={true}
        emptyMessage="No shows found. Create your first show to get started."
        emptyIcon={<span>🎙️</span>}
        emptyAction={
          <button onClick={handleCreate} className="btn-primary">
            Create Show
          </button>
        }
      />
    </div>
  );
}
```

## Accessibility

- Keyboard navigation supported (Tab through interactive elements)
- ARIA labels on checkboxes for screen readers
- Semantic HTML table structure
- Focus indicators on interactive elements
- Proper heading hierarchy in empty/error states

## Responsive Behavior

- **Desktop (> 768px)**: Full table with all columns
- **Tablet (640px - 768px)**: Reduced padding, smaller fonts
- **Mobile (< 640px)**: Columns marked with `hideOnMobile` are hidden

## Styling

The component uses CSS classes that can be customized:

- `.content-table-wrapper` - Table container
- `.content-table` - Table element
- `.content-table-error` - Error state container
- `.content-table-empty` - Empty state container
- `.skeleton` - Loading skeleton elements
- `.hide-mobile` - Hidden on mobile devices
- `.sticky-header` - Sticky header modifier

## Performance Considerations

- Skeleton loader shows 5 rows by default to prevent layout shift
- Smooth animations with CSS transitions
- Efficient re-renders with proper key props
- Responsive column hiding reduces DOM complexity on mobile

## Requirements Validated

This component validates the following requirements from the spec:

- **9.1**: Error handling with retry functionality
- **9.2**: Sortable columns with visual indicators
- **9.3-9.4**: Pagination support (via parent component)
- **9.5**: Search functionality (via parent component)
- **9.7**: Action buttons in columns (via custom render)
- **9.8**: Row click handling
- **9.9**: Row selection with checkboxes
- **9.10**: Empty state with call-to-action
- **9.11**: Timestamp display (via custom render)
