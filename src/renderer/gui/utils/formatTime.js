export const formatTime = (seconds, withMilliseconds = false) => {
    if (!Number.isFinite(seconds)) return withMilliseconds ? '0:00.00' : '00:00';
  
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
  
    if (withMilliseconds) {
      const ms = Math.floor((seconds % 1) * 100);
      return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
  
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  