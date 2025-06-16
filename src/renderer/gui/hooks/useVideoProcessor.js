import { useState, useCallback, useRef } from 'react';

const useVideoProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  // Initialize worker
  const initWorker = useCallback(() => {
    try {
      // Simulate worker initialization
      // In real implementation, this would initialize FFmpeg worker
      console.log('Worker initialized');
    } catch (err) {
      console.error('Failed to initialize worker:', err);
      setError('Không thể khởi tạo worker xử lý video');
    }
  }, []);

  // Process video
  const processVideo = useCallback(async (file, options) => {
    if (!file) {
      throw new Error('Không có file được chọn');
    }

    setProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate video processing
      // In real implementation, this would use FFmpeg to cut video
      
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i / totalSteps);
      }

      // Simulate file creation
      const outputFileName = generateOutputFileName(file.name, options);
      
      console.log('Video processing completed:', {
        input: file.name,
        output: outputFileName,
        options
      });

      return {
        success: true,
        outputFile: outputFileName,
        message: 'Video đã được cắt thành công'
      };
    } catch (err) {
      console.error('Video processing error:', err);
      setError(err.message || 'Lỗi không xác định khi xử lý video');
      throw err;
    } finally {
      setProcessing(false);
    }
  }, []);

  // Generate output file name
  const generateOutputFileName = (inputName, options) => {
    const nameWithoutExt = inputName.replace(/\.[^/.]+$/, '');
    const ext = inputName.split('.').pop();
    
    let suffix = '';
    
    if (options.mode === 'single') {
      const startTime = Math.floor(options.startTime);
      const endTime = Math.floor(options.endTime);
      suffix = `_cut_${startTime}s-${endTime}s`;
    } else if (options.mode === 'segments') {
      suffix = '_segments';
    } else if (options.mode === 'remove') {
      suffix = '_removed';
    }
    
    if (options.lossless) {
      suffix += '_lossless';
    }
    
    return `${nameWithoutExt}${suffix}.${ext}`;
  };

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setProcessing(false);
    setProgress(0);
    setError(null);
  }, []);

  // Get processing status
  const getStatus = useCallback(() => {
    return {
      processing,
      progress,
      error,
      isReady: !processing && !error
    };
  }, [processing, progress, error]);

  return {
    processing,
    progress,
    error,
    processVideo,
    initWorker,
    clearError,
    reset,
    getStatus
  };
};

export default useVideoProcessor;