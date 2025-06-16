import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';

const useVideoProcessor = () => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const ffmpegWorker = useRef(null);

  const initWorker = useCallback(() => {
    if (!ffmpegWorker.current) {
      ffmpegWorker.current = new Worker('/ffmpeg-worker.js');
      ffmpegWorker.current.onmessage = handleWorkerMessage;
    }
  }, []);

  const handleWorkerMessage = useCallback((e) => {
    const { type, data } = e.data;
    switch (type) {
      case 'progress':
        setProgress(data);
        break;
      case 'done':
        setProcessing(false);
        setProgress(100);
        message.success('Xử lý video thành công!');
        break;
      case 'error':
        setProcessing(false);
        setError(data.message || 'Lỗi không xác định');
        message.error(`Lỗi: ${data.message || 'Không rõ nguyên nhân'}`);
        break;
    }
  }, []);

  const processVideo = useCallback((options) => {
    if (!ffmpegWorker.current) {
      initWorker();
    }
    setProcessing(true);
    setProgress(0);
    setError(null);
    ffmpegWorker.current.postMessage(options);
  }, [initWorker]);

  return {
    processing,
    progress,
    error,
    processVideo,
    initWorker
  };
};

export default useVideoProcessor;
