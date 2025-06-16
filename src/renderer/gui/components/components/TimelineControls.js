import React from 'react';
import { Slider,Typography , InputNumber, Button, Space, Menu, Dropdown, Tooltip, Card, Row, Col, Divider } from 'antd';
import PropTypes from 'prop-types';
const { Title, Text } = Typography;
import { BackwardOutlined, ForwardOutlined } from '@ant-design/icons';

const TimelineControls = ({
  videoInfo,
  videoState,
  setVideoInfo,
  handleTimelineChange,
  formatTime,
  seekTo,
  renderFrame,
  theme
}) => (
  <Card className={`rounded-xl mb-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
    <div className="flex items-center justify-between mb-3">
      <Title level={5} className={`mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Điều chỉnh vùng cắt</Title>
      <Space>
        <Tooltip title="Đặt điểm bắt đầu">
          <Button
            size="small"
            icon={<BackwardOutlined />}
            onClick={() => {
              setVideoInfo(prev => ({ ...prev, cutStart: videoState.currentTime }));
            }}
          >
            Đặt Start
          </Button>
        </Tooltip>
        <Tooltip title="Đặt điểm kết thúc">
          <Button
            size="small"
            icon={<ForwardOutlined />}
            onClick={() => {
              setVideoInfo(prev => ({ ...prev, cutEnd: videoState.currentTime }));
            }}
          >
            Đặt End
          </Button>
        </Tooltip>
      </Space>
    </div>
    <div className="mb-4">
      <Slider
        range
        min={0}
        max={videoState.duration || 100}
        value={[videoInfo.cutStart, videoInfo.cutEnd]}
        step={0.1}
        onChange={handleTimelineChange}
        tooltip={{ formatter: formatTime }}
        className="timeline-slider"
      />
    </div>
    <Row gutter={[16, 8]}>
      <Col xs={24} sm={8}>
        <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
          <Text strong className="text-blue-600 block text-xs mb-1">BẮT ĐẦU</Text>
          <Text strong className="text-blue-700">{formatTime(videoInfo.cutStart)}</Text>
        </div>
      </Col>
      <Col xs={24} sm={8}>
        <div className="text-center p-2 bg-green-50 rounded border border-green-200">
          <Text strong className="text-green-600 block text-xs mb-1">KẾT THÚC</Text>
          <Text strong className="text-green-700">{formatTime(videoInfo.cutEnd)}</Text>
        </div>
      </Col>
      <Col xs={24} sm={8}>
        <div className="text-center p-2 bg-red-50 rounded border border-red-200">
          <Text strong className="text-red-600 block text-xs mb-1">ĐỘ DÀI</Text>
          <Text strong className="text-red-700">{formatTime(videoInfo.cutEnd - videoInfo.cutStart)}</Text>
        </div>
      </Col>
    </Row>
    <Divider className="my-3" />
    <div className="flex flex-wrap gap-2">
      <Button
        size="small"
        onClick={() => {
          const duration = videoState.duration;
          setVideoInfo(prev => ({ ...prev, cutStart: 0, cutEnd: duration }));
        }}
      >
        Toàn bộ video
      </Button>
      <Button
        size="small"
        onClick={() => {
          const current = videoState.currentTime;
          setVideoInfo(prev => ({ ...prev, cutStart: Math.max(0, current - 30), cutEnd: Math.min(videoState.duration, current + 30) }));
        }}
      >
        ±30s từ hiện tại
      </Button>
      <Button
        size="small"
        onClick={() => {
          const current = videoState.currentTime;
          setVideoInfo(prev => ({ ...prev, cutStart: Math.max(0, current - 60), cutEnd: Math.min(videoState.duration, current + 60) }));
        }}
      >
        ±1 phút từ hiện tại
      </Button>
    </div>
  </Card>
);

TimelineControls.propTypes = {
  videoInfo: PropTypes.object.isRequired,
  videoState: PropTypes.object.isRequired,
  setVideoInfo: PropTypes.func.isRequired,
  handleTimelineChange: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
  seekTo: PropTypes.func.isRequired,
  renderFrame: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
};

export default TimelineControls;
