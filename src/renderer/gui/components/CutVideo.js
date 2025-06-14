import React, { useRef, useState } from 'react';
import {
  Slider, Button, Progress, Typography, Upload, Space, Card, Divider, Row, Col, Radio, InputNumber, Checkbox, message, Tooltip, Modal
} from 'antd';
import {
  PlayCircleFilled, PauseCircleFilled, ScissorOutlined, UploadOutlined, FolderOpenOutlined, PictureOutlined, UndoOutlined, RedoOutlined, EyeOutlined, InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const CutVideo = () => {
  const [videoInfo, setVideoInfo] = useState({
    duration: 0,
    currentTime: 0,
    cutStart: 0,
    cutEnd: 10,
    isPlaying: false,
    mode: 'manual',
    segmentTime: 15,
    segmentCount: 3,
    multiType: 'duration',
    lossless: true,
    snapKeyframe: true,
    sceneTimestamps: [],
    thumbnailInterval: 1,
    thumbnails: [],
    logs: [],
    undoStack: [],
    redoStack: [],
    saveDir: '',
    showPreview: false
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ffmpegWorker = useRef(null);

  const handleFileSelect = ({ file }) => {
    const video = videoRef.current;
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      setVideoInfo(prev => ({
        ...prev,
        duration: video.duration,
        cutEnd: video.duration > 10 ? 10 : video.duration
      }));
      ffmpegWorker.current = new Worker('ffmpeg-worker.js');
    };
  };

  const renderFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  };

  const handleSelectSaveDir = async () => {
    const dir = window.prompt('Nhập đường dẫn thư mục lưu:', videoInfo.saveDir || '');
    if (dir) setVideoInfo(prev => ({ ...prev, saveDir: dir }));
  };

  const handleModeChange = e => {
    setVideoInfo(prev => ({ ...prev, mode: e.target.value }));
  };

  const handleExtractThumbnails = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const thumbnails = [];
    const interval = videoInfo.thumbnailInterval;
    const originalTime = video.currentTime;
    const capture = (time) => {
      return new Promise(resolve => {
        video.currentTime = time;
        video.onseeked = () => {
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnails.push(canvas.toDataURL('image/jpeg'));
          resolve();
        };
      });
    };
    const generateThumbnails = async () => {
      for (let t = 0; t < video.duration; t += interval) {
        await capture(t);
      }
      setVideoInfo(prev => ({ ...prev, thumbnails }));
      video.currentTime = originalTime;
      message.success('Trích xuất ảnh thành công');
    };
    generateThumbnails();
  };

  const handleUndo = () => {
    if (videoInfo.undoStack.length === 0) return;
    const prev = videoInfo.undoStack[videoInfo.undoStack.length - 1];
    setVideoInfo(v => ({ ...v, ...prev, redoStack: [v, ...v.redoStack], undoStack: v.undoStack.slice(0, -1) }));
  };
  const handleRedo = () => {
    if (videoInfo.redoStack.length === 0) return;
    const next = videoInfo.redoStack[0];
    setVideoInfo(v => ({ ...v, ...next, undoStack: [...v.undoStack, v], redoStack: v.redoStack.slice(1) }));
  };
  const pushUndo = (state) => {
    setVideoInfo(v => ({ ...v, undoStack: [...v.undoStack, state], redoStack: [] }));
  };

  const handleCutVideo = () => {
    if (!videoRef.current) return;
    if (!videoInfo.saveDir) {
      message.error('Vui lòng chọn thư mục lưu trước khi cắt!');
      return;
    }
    message.success('Đã gửi yêu cầu cắt video');
    setVideoInfo(v => ({ ...v, logs: [...v.logs, `Bắt đầu cắt từ ${videoInfo.cutStart}s đến ${videoInfo.cutEnd}s`] }));
    ffmpegWorker.current.postMessage({
      type: 'CUT',
      input: videoRef.current.src,
      start: videoInfo.cutStart,
      end: videoInfo.cutEnd,
      output: `${videoInfo.saveDir}/cut_${Date.now()}.mp4`,
      options: {
        lossless: videoInfo.lossless,
        mode: videoInfo.mode
      }
    });
  };

  return (
    <div className="cut-video-container">
      <Title level={3}>✂️ Cắt Video Chuyên Nghiệp</Title>
      <Card className="card-section">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Upload accept="video/*" showUploadList={false} beforeUpload={() => false} onChange={handleFileSelect}>
              <Button icon={<UploadOutlined />}>Tải video lên</Button>
            </Upload>
          </Col>
          <Col>
            <Button icon={<FolderOpenOutlined />} onClick={handleSelectSaveDir}>Chọn thư mục lưu</Button>
          </Col>
          <Col>
            <Button type="primary" icon={<ScissorOutlined />} onClick={handleCutVideo} disabled={!videoInfo.duration}>
              Bắt đầu cắt
            </Button>
          </Col>
        </Row>
      </Card>
      <Row gutter={24}>
        <Col span={16}>
          <canvas ref={canvasRef} className="video-canvas" />
          <div className="thumbnail-preview">
            {videoInfo.thumbnails.map((src, idx) => (
              <img key={idx} src={src} alt={`thumb-${idx}`} className="thumb-img" />
            ))}
          </div>
        </Col>
        <Col span={8}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {videoInfo.isPlaying ? (
              <Button icon={<PauseCircleFilled />} onClick={() => {
                videoRef.current.pause();
                setVideoInfo(prev => ({ ...prev, isPlaying: false }));
              }}>Tạm dừng</Button>
            ) : (
              <Button type="primary" icon={<PlayCircleFilled />} onClick={() => {
                videoRef.current.play();
                setVideoInfo(prev => ({ ...prev, isPlaying: true }));
              }}>Phát</Button>
            )}
            <Progress percent={(videoInfo.currentTime / videoInfo.duration) * 100 || 0} showInfo={false} />
            <Text type="secondary">
              {new Date(videoInfo.currentTime * 1000).toISOString().substr(11, 8)} / {new Date(videoInfo.duration * 1000).toISOString().substr(11, 8)}
            </Text>
            <Divider />
            <Text strong>📸 Trích xuất ảnh thumbnail mỗi n giây</Text>
            <Space>
              <InputNumber min={1} value={videoInfo.thumbnailInterval} onChange={val => setVideoInfo(prev => ({ ...prev, thumbnailInterval: val }))} />
              <Button icon={<PictureOutlined />} onClick={handleExtractThumbnails}>Trích xuất</Button>
            </Space>
          </Space>
        </Col>
      </Row>
      <Divider />
      <div className="options-section">
        <Title level={5}>🎚️ Chế độ cắt video</Title>
        <Radio.Group value={videoInfo.mode} onChange={handleModeChange}>
          <Radio value="manual">✂️ Cắt thủ công</Radio>
          <Radio value="scene">🧠 Cắt theo cảnh</Radio>
          <Radio value="keyframe">🧲 Bám keyframe</Radio>
          <Radio value="multi">📎 Multi-cut</Radio>
        </Radio.Group>
        {videoInfo.mode === 'multi' && (
          <Space direction="vertical" style={{ marginTop: 12 }}>
            <Radio.Group
              value={videoInfo.multiType}
              onChange={e => setVideoInfo(prev => ({ ...prev, multiType: e.target.value }))}
            >
              <Radio value="duration">⏱ Theo thời lượng mỗi đoạn</Radio>
              <Radio value="count">🔢 Theo số lượng đoạn</Radio>
            </Radio.Group>
            {videoInfo.multiType === 'duration' && (
              <InputNumber
                min={1}
                value={videoInfo.segmentTime}
                onChange={val => setVideoInfo(prev => ({ ...prev, segmentTime: val }))}
                addonAfter="giây/đoạn"
              />
            )}
            {videoInfo.multiType === 'count' && (
              <InputNumber
                min={2}
                value={videoInfo.segmentCount}
                onChange={val => setVideoInfo(prev => ({ ...prev, segmentCount: val }))}
                addonAfter="đoạn"
              />
            )}
          </Space>
        )}
        <div className="checkbox-options">
          <Checkbox checked={videoInfo.lossless} onChange={e => setVideoInfo(prev => ({ ...prev, lossless: e.target.checked }))}>
            🎯 Cắt không mất chất lượng (Lossless)
          </Checkbox>
          <Checkbox checked={videoInfo.snapKeyframe} onChange={e => setVideoInfo(prev => ({ ...prev, snapKeyframe: e.target.checked }))}>
            🧲 Bám keyframe
          </Checkbox>
        </div>
      </div>
      <Divider />
      <div className="slider-section">
        <Slider
          range
          min={0}
          max={videoInfo.duration}
          value={[videoInfo.cutStart, videoInfo.cutEnd]}
          step={0.1}
          onChange={([start, end]) => {
            setVideoInfo(prev => ({ ...prev, cutStart: start, cutEnd: end }));
            videoRef.current.currentTime = start;
            renderFrame();
          }}
          tipFormatter={v => new Date(v * 1000).toISOString().substr(11, 8)}
        />
        <div className="slider-labels">
          <Text>Bắt đầu: {videoInfo.cutStart.toFixed(1)}s</Text>
          <Text>Kết thúc: {videoInfo.cutEnd.toFixed(1)}s</Text>
          <Text strong>Tổng: {(videoInfo.cutEnd - videoInfo.cutStart).toFixed(1)}s</Text>
        </div>
      </div>
      <Button icon={<EyeOutlined />} onClick={() => setVideoInfo(v => ({ ...v, showPreview: true }))}>
        Xem trước
      </Button>
      <Modal visible={videoInfo.showPreview} onCancel={() => setVideoInfo(v => ({ ...v, showPreview: false }))} footer={null} width={800}>
        <video src={videoRef.current?.src} controls style={{ width: '100%' }} />
      </Modal>
      <div className="log-section">
        <Title level={5} style={{ marginTop: 16 }}>📝 Nhật ký thao tác</Title>
        <div className="log-list">
          {videoInfo.logs.map((log, idx) => (
            <div key={idx} className="log-item">{log}</div>
          ))}
        </div>
      </div>
      <video ref={videoRef} style={{ display: 'none' }} onTimeUpdate={() => {
        setVideoInfo(prev => ({ ...prev, currentTime: videoRef.current.currentTime }));
        renderFrame();
      }} />
    </div>
  );
};

export default CutVideo;