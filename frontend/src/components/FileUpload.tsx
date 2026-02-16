import { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface FileUploadProps {
  type: 'audio' | 'image' | 'document';
  onUploadComplete: (fileData: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
}

interface UploadedFile {
  key: string;
  url: string;
  cdnUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export default function FileUpload({
  type,
  onUploadComplete,
  onUploadError,
  accept,
  maxSize,
  label
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    if (accept) return accept;
    
    switch (type) {
      case 'audio':
        return 'audio/*,.mp3,.wav,.ogg,.aac,.flac';
      case 'image':
        return 'image/*,.jpg,.jpeg,.png,.gif,.webp';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      default:
        return '*/*';
    }
  };

  const getMaxSize = () => {
    if (maxSize) return maxSize;
    
    switch (type) {
      case 'audio':
        return 100 * 1024 * 1024; // 100MB
      case 'image':
        return 5 * 1024 * 1024; // 5MB
      case 'document':
        return 10 * 1024 * 1024; // 10MB
      default:
        return 10 * 1024 * 1024;
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxFileSize = getMaxSize();
    if (file.size > maxFileSize) {
      const errorMsg = `File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/upload/${type}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setProgress(percentCompleted);
            }
          }
        }
      );

      onUploadComplete(response.data.file);
      setProgress(100);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Upload failed';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={isUploading}
      />
      
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="btn btn-secondary"
        style={{
          opacity: isUploading ? 0.6 : 1,
          cursor: isUploading ? 'not-allowed' : 'pointer'
        }}
      >
        {isUploading ? `Uploading... ${progress}%` : label || `Upload ${type}`}
      </button>

      {isUploading && (
        <div style={{ marginTop: '0.5rem' }}>
          <div
            style={{
              width: '100%',
              height: '4px',
              background: '#f0f0f0',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#ff6b35',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            color: '#d9534f',
            fontSize: '0.9rem'
          }}
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
