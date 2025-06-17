import React from 'react';
import {
  Slider, Typography, InputNumber, Button,
  Space, Tooltip, Card, Row, Col
} from 'antd';
import PropTypes from 'prop-types';
import {
  BackwardOutlined, ForwardOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

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
      <Title level={5} className={`mb-0 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Điều chỉnh vùng cắt
      </Title>
      <Space>
        <Tooltip
          title="Đặt điểm bắt đầu"
          destroyOnHidden
          styles={{
            body: {
              maxWidth: 250,
              padding: '8px 12px',
              fontSize: '12px',
              lineHeight: '1.5'
            }
          }}
        >
          <Button
            size="small"
            icon={<BackwardOutlined />}
            onClick={() =>
              setVideoInfo(prev => ({ ...prev, cutStart: videoState.currentTime }))
            }
          >
            Đặt Start
          </Button>
        </Tooltip>
        <Tooltip
          title="Đặt điểm kết thúc"
          destroyOnHidden
          styles={{
            body: {
              maxWidth: 250,
              padding: '8px 12px',
              fontSize: '12px',
              lineHeight: '1.5'
            }
          }}
        >
          <Button
            size="small"
            icon={<ForwardOutlined />}
            onClick={() =>
              setVideoInfo(prev => ({ ...prev, cutEnd: videoState.currentTime }))
            }
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
        value={[
          Math.max(0, Math.min(videoInfo.cutStart, videoInfo.cutEnd)),
          Math.max(0, Math.max(videoInfo.cutStart, videoInfo.cutEnd))
        ]}
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
          <InputNumber
            min={0}
            max={videoState.duration}
            step={0.1}
            value={videoInfo.cutStart}
            onChange={val =>
              setVideoInfo(prev => ({ ...prev, cutStart: val }))
            }
            className="w-full"
          />
        </div>
      </Col>

      <Col xs={24} sm={8}>
        <div className="text-center p-2 bg-green-50 rounded border border-green-200">
          <Text strong className="text-green-600 block text-xs mb-1">KẾT THÚC</Text>
          <InputNumber
            min={0}
            max={videoState.duration}
            step={0.1}
            value={videoInfo.cutEnd}
            onChange={val =>
              setVideoInfo(prev => ({ ...prev, cutEnd: val }))
            }
            className="w-full"
          />
        </div>
      </Col>

      <Col xs={24} sm={8}>
        <div className="text-center p-2 bg-yellow-50 rounded border border-yellow-200">
          <Text strong className="text-yellow-600 block text-xs mb-1">THỜI LƯỢNG</Text>
          <span className="block text-lg font-bold">
            {formatTime(Math.max(0, videoInfo.cutEnd - videoInfo.cutStart))}
          </span>
        </div>
      </Col>
    </Row>
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
