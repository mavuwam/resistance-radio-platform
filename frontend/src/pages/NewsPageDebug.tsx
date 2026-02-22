import React, { useState, useEffect } from 'react';

const NewsPageDebug: React.FC = () => {
  const [status, setStatus] = useState('Not started');
  const [articles, setArticles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFetch();
  }, []);

  const testFetch = async () => {
    try {
      setStatus('Starting fetch...');
      console.log('DEBUG: Starting fetch');
      
      // Test 1: Direct fetch to proxy
      setStatus('Test 1: Fetching via proxy /api/articles');
      const response1 = await fetch('/api/articles');
      console.log('DEBUG: Response 1 status:', response1.status);
      const data1 = await response1.json();
      console.log('DEBUG: Response 1 data:', data1);
      
      // Test 2: Direct fetch to backend
      setStatus('Test 2: Fetching directly from backend');
      const response2 = await fetch('http://localhost:5000/api/articles');
      console.log('DEBUG: Response 2 status:', response2.status);
      const data2 = await response2.json();
      console.log('DEBUG: Response 2 data:', data2);
      
      setArticles(data1.articles || []);
      setStatus(`Success! Found ${data1.articles?.length || 0} articles`);
    } catch (err: any) {
      console.error('DEBUG: Error:', err);
      setError(err.message);
      setStatus('Error occurred');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>News Page Debug</h1>
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      {error && (
        <div style={{ background: '#ffcccc', padding: '10px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <strong>Articles Count:</strong> {articles.length}
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Articles:</h2>
        {articles.map((article, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <strong>{article.title}</strong>
            <div>ID: {article.id}</div>
            <div>Slug: {article.slug}</div>
            <div>Status: {article.status}</div>
            <div>Published: {article.published_at}</div>
          </div>
        ))}
      </div>
      
      <button onClick={testFetch} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Retry Fetch
      </button>
    </div>
  );
};

export default NewsPageDebug;
