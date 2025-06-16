import { useState, useCallback, useEffect } from 'react';

const useFileManager = () => {
  const [files, setFiles] = useState([]);
  const [saveDir, setSaveDir] = useState('');
  const [recentFiles, setRecentFiles] = useState([]);

  const addFile = useCallback((file) => {
    const fileInfo = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      addedAt: new Date()
    };
    setFiles(prev => [fileInfo, ...prev]);
    setRecentFiles(prev => [fileInfo, ...prev.slice(0, 4)]);
    return fileInfo;
  }, []);

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const selectSaveDirectory = useCallback(() => {
    const dir = window.prompt('Nhập đường dẫn thư mục lưu:', saveDir || '');
    if (dir) {
      setSaveDir(dir);
      localStorage.setItem('videoEditor_saveDir', dir);
    }
  }, [saveDir]);

  useEffect(() => {
    const savedDir = localStorage.getItem('videoEditor_saveDir');
    if (savedDir) setSaveDir(savedDir);
  }, []);

  return {
    files,
    saveDir,
    recentFiles,
    addFile,
    removeFile,
    selectSaveDirectory
  };
};

export default useFileManager;
