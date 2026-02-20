import { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import './FileUploader.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface FileUploaderProps {
  type: 'audio' | 'image' | 'document';
  onUploadComplete: (fileData: UploadedFile) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  multiple?: boolean;
  currentFile?: string;
  showPreview?: boolean;
}

interface UploadedFile {
  key: string;
  url: string;
  cdnUrl: string;
  originalName: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

export default function FileUploader({
  type,
  onUploadComplete,
  onUploadError,
  accept,
  maxSize,
  label,
  multiple = false,
  currentFile,
  showPreview = true
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    if (accept) return accept;
    
    switch (type) {
      case 'audio':
        return 'audio/*,.mp3,.wav,.ogg,.aac,.flac';
      case 'image':
        return 'image/*,.jpg,.jpeg,.png,.gif,.webp';
      case 'document':
        return '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip';
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxFileSize = getMaxSize();
    if (file.size > maxFileSize) {
      const errorMsg = `File too large. Maximum size is ${formatFileSize(maxFileSize)}`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    // Show preview for images
    if (type === 'image' && showPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_URL}/api/upload/${type}`,
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
      
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Upload failed';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptTypes()}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={isUploading}
        multiple={multiple}
      />
      
      {showPreview && preview && type === 'image' && (
        <div className="file-preview">
          <img src={preview} alt="Preview" />
          <button
            type="button"
            onClick={handleRemove}
            className="btn-remove"
            disabled={isUploading}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        className={`btn-upload ${isUploading ? 'uploading' : ''}`}
      >
        {isUploading ? (
          <>
            <span className="upload-spinner"></span>
            Uploading... {progress}%
          </>
        ) : (
          <>
            <span className="upload-icon">📁</span>
            {label || `Choose ${type}`}
          </>
        )}
      </button>

      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}

      {error && (
        <div className="upload-error" role="alert">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="upload-hint">
        Max size: {formatFileSize(getMaxSize())}
      </div>
    </div>
  );
}
