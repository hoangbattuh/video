// ffmpeg-worker.js

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({
  log: true,
  corePath: './ffmpeg-core.js' // Đường dẫn đến ffmpeg-core.js
});

self.onmessage = async (event) => {
  const { type, input, start, end, output } = event.data;

  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  if (type === 'CUT') {
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(input));
    await ffmpeg.run('-i', 'input.mp4', '-ss', start.toString(), '-to', end.toString(), '-c', 'copy', output);
    const data = ffmpeg.FS('readFile', output);
    self.postMessage({ type: 'DONE', data: data.buffer, outputFileName: output });
  }
};