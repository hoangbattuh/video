import { useState, useCallback, useEffect } from 'react';

const useFileManager = () => {
  const [files, setFiles] = useState([]);
  const [saveDir, setSaveDir] = useState('');
  const [recentFiles, setRecentFiles] = useState([]);

  // Load saved data from localStorage
  useEffect(() => {
    try {
      const savedRecentFiles = localStorage.getItem('videoEditor_recentFiles');
      const savedSaveDir = localStorage.getItem('videoEditor_saveDir');
      
      if (savedRecentFiles) {
        setRecentFiles(JSON.parse(savedRecentFiles));
      }
      
      if (savedSaveDir) {
        setSaveDir(savedSaveDir);
      }
    } catch (err) {
      console.error('Error loading saved data:', err);
    }
  }, []);

  // Save recent files to localStorage
  const saveRecentFiles = useCallback((files) => {
    try {
      localStorage.setItem('videoEditor_recentFiles', JSON.stringify(files));
    } catch (err) {
      console.error('Error saving recent files:', err);
    }
  }, []);

  // Add file
  const addFile = useCallback((file) => {
    const fileInfo = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      url: URL.createObjectURL(file),
      file: file,
      addedAt: new Date().toISOString()
    };

    setFiles(prev => {
      const newFiles = [fileInfo, ...prev.filter(f => f.name !== file.name)];
      return newFiles.slice(0, 10); // Keep only last 10 files
    });

    // Add to recent files
    const recentFileInfo = {
      id: fileInfo.id,
      name: file.name,
      size: file.size,
      path: file.path || file.webkitRelativePath || '',
      addedAt: fileInfo.addedAt
    };

    setRecentFiles(prev => {
      const newRecentFiles = [recentFileInfo, ...prev.filter(f => f.name !== file.name)];
      const limitedFiles = newRecentFiles.slice(0, 20); // Keep only last 20 recent files
      saveRecentFiles(limitedFiles);
      return limitedFiles;
    });

    return fileInfo;
  }, [saveRecentFiles]);

  // Remove file
  const removeFile = useCallback((fileId) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles(prev => {
      prev.forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
      return [];
    });
  }, []);

  // Select save directory
  const selectSaveDirectory = useCallback(async () => {
    try {
      // In Electron environment, you would use dialog API
      // For now, we'll simulate directory selection
      const mockDir = 'C:\\Users\\Downloads\\VideoEditor';
      setSaveDir(mockDir);
      localStorage.setItem('videoEditor_saveDir', mockDir);
      return mockDir;
    } catch (err) {
      console.error('Error selecting directory:', err);
      throw new Error('Không thể chọn thư mục lưu file');
    }
  }, []);

  // Get file by ID
  const getFileById = useCallback((fileId) => {
    return files.find(f => f.id === fileId);
  }, [files]);

  // Get file info
  const getFileInfo = useCallback((file) => {
    if (!file) return null;
    
    return {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      duration: file.duration || 0,
      dimensions: file.videoWidth && file.videoHeight ? 
        `${file.videoWidth}x${file.videoHeight}` : 'Unknown'
    };
  }, []);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove recent file
  const removeRecentFile = useCallback((fileId) => {
    setRecentFiles(prev => {
      const newRecentFiles = prev.filter(f => f.id !== fileId);
      saveRecentFiles(newRecentFiles);
      return newRecentFiles;
    });
  }, [saveRecentFiles]);

  // Clear recent files
  const clearRecentFiles = useCallback(() => {
    setRecentFiles([]);
    localStorage.removeItem('videoEditor_recentFiles');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [files]);

  return {
    files,
    saveDir,
    recentFiles,
    addFile,
    removeFile,
    clearFiles,
    selectSaveDirectory,
    getFileById,
    getFileInfo,
    removeRecentFile,
    clearRecentFiles,
    formatFileSize
  };
};

export default useFileManager;