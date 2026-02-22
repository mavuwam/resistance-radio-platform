import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  formData: any;
  formId: string;
  saveInterval?: number; // in milliseconds, default 30 seconds
  enabled?: boolean; // allow disabling auto-save
}

interface UseAutoSaveReturn {
  saveDraft: () => void;
  restoreDraft: () => any | null;
  clearDraft: () => void;
  hasDraft: () => boolean;
  getDraftTimestamp: () => number | null;
}

/**
 * Custom hook for auto-saving form data to localStorage
 * 
 * @param options - Configuration options
 * @param options.formData - The form data to auto-save
 * @param options.formId - Unique identifier for the form (used as localStorage key)
 * @param options.saveInterval - Auto-save interval in milliseconds (default: 30000ms / 30s)
 * @param options.enabled - Whether auto-save is enabled (default: true)
 * 
 * @returns Object with functions to manage draft data
 * 
 * @example
 * const { saveDraft, restoreDraft, clearDraft, hasDraft } = useAutoSave({
 *   formData,
 *   formId: 'admin-shows-form',
 *   saveInterval: 30000
 * });
 */
export function useAutoSave({
  formData,
  formId,
  saveInterval = 30000,
  enabled = true
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const storageKey = `draft_${formId}`;

  /**
   * Save current form data to localStorage
   */
  const saveDraft = useCallback(() => {
    if (!enabled) return;

    try {
      const draftData = {
        data: formData,
        timestamp: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [formData, storageKey, enabled]);

  /**
   * Restore draft data from localStorage
   * @returns The restored form data or null if no draft exists
   */
  const restoreDraft = useCallback((): any | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draftData = JSON.parse(stored);
      return draftData.data;
    } catch (error) {
      console.error('Failed to restore draft:', error);
      return null;
    }
  }, [storageKey]);

  /**
   * Clear draft data from localStorage
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [storageKey]);

  /**
   * Check if a draft exists in localStorage
   * @returns true if draft exists, false otherwise
   */
  const hasDraft = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null;
    } catch (error) {
      console.error('Failed to check draft:', error);
      return false;
    }
  }, [storageKey]);

  /**
   * Get the timestamp of when the draft was saved
   * @returns timestamp in milliseconds or null if no draft exists
   */
  const getDraftTimestamp = useCallback((): number | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return null;

      const draftData = JSON.parse(stored);
      return draftData.timestamp || null;
    } catch (error) {
      console.error('Failed to get draft timestamp:', error);
      return null;
    }
  }, [storageKey]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled) return;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      saveDraft();
    }, saveInterval);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveDraft, saveInterval, enabled]);

  return {
    saveDraft,
    restoreDraft,
    clearDraft,
    hasDraft,
    getDraftTimestamp
  };
}
