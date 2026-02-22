import { useState, useEffect } from 'react';
import { useToastContext } from '../contexts/ToastContext';
import { LoadingOverlay } from '../components/Loading';
import TrashTable from '../components/TrashTable';
import { getTrash, restoreContent } from 'shared';
import './AdminTrashPage.css';

interface TrashItem {
  id: number;
  title: string;
  deleted_at: string;
  deleted_by: number;
  deleted_by_email: string;
  protected: boolean;
  [key: string]: any;
}

interface TrashData {
  articles: TrashItem[];
  shows: TrashItem[];
  episodes: TrashItem[];
  events: TrashItem[];
  resources: TrashItem[];
}

type ContentType = 'articles' | 'shows' | 'episodes' | 'events' | 'resources';

export default function AdminTrashPage() {
  const [trashData, setTrashData] = useState<TrashData | null>(null);
  const [activeTab, setActiveTab] = useState<ContentType>('articles');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToastContext();

  useEffect(() => {
    fetchTrashData();
  }, []);

  const fetchTrashData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTrash();
      setTrashData(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to load trash';
      setError(errorMessage);
      addToast('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (contentType: string, id: number) => {
    try {
      await restoreContent(contentType, id);
      addToast('success', 'Content restored successfully');
      
      // Refresh trash data
      await fetchTrashData();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 'Failed to restore content';
      addToast('error', errorMessage);
    }
  };

  const tabs: { key: ContentType; label: string }[] = [
    { key: 'articles', label: 'Articles' },
    { key: 'shows', label: 'Shows' },
    { key: 'episodes', label: 'Episodes' },
    { key: 'events', label: 'Events' },
    { key: 'resources', label: 'Resources' }
  ];

  if (loading) {
    return <LoadingOverlay message="Loading trash..." />;
  }

  if (error && !trashData) {
    return (
      <div className="trash-page">
        <div className="error-state">
          <h2>Error Loading Trash</h2>
          <p>{error}</p>
          <button onClick={fetchTrashData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeItems = trashData?.[activeTab] || [];

  return (
    <div className="trash-page">
      <div className="page-header">
        <h1>Trash</h1>
        <p className="page-description">
          Recover recently deleted content. Items are automatically deleted after 30 days (60 days for protected content).
        </p>
      </div>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {trashData && trashData[tab.key].length > 0 && (
              <span className="tab-badge">{trashData[tab.key].length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <TrashTable
          items={activeItems}
          contentType={activeTab}
          onRestore={handleRestore}
        />
      </div>
    </div>
  );
}
