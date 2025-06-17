import React, { memo } from 'react';
import {
  Card, Typography, Radio, Switch, Select, InputNumber,
  Tooltip, Tabs, Button
} from 'antd';
import {
  ScissorOutlined, SplitCellsOutlined, EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const RightSidebar = memo(({
  videoInfo,
  setVideoInfo,
  activeTab,
  setActiveTab,
  handleModeChange,
  handleAdvancedOptionChange,
  handleCutVideo,
  groupedOptions,
  formatTime,
  showTooltips,
  videoState
}) => {
  const showNoFileNotice = !videoInfo.selectedFile;

  const basicTab = {
    key: 'basic',
    label: 'Cơ bản',
    children: (
      <div className="space-y-4">
        <Card size="small">
          <Title level={5} className="mb-3">✂️ Chế độ cắt</Title>
          <Radio.Group
            value={videoInfo.mode}
            onChange={(e) => handleModeChange(e.target.value)}
            className="w-full"
          >
            <div className="space-y-2">
              <Radio value="manual" className="w-full">
                <div className="flex items-center">
                  <ScissorOutlined className="mr-2" />
                  <span>Cắt thủ công</span>
                </div>
              </Radio>
              <Radio value="segments" className="w-full">
                <div className="flex items-center">
                  <SplitCellsOutlined className="mr-2" />
                  <span>Chia đoạn</span>
                </div>
              </Radio>
            </div>
          </Radio.Group>

          {videoInfo.mode === "segments" && (
            <div className="mt-3 space-y-3">
              <div>
                <Text className="text-sm">Loại chia đoạn:</Text>
                <Select
                  value={videoInfo.multiType}
                  onChange={(value) =>
                    setVideoInfo((prev) => ({ ...prev, multiType: value }))
                  }
                  className="w-full mt-1"
                  size="small"
                >
                  <Option value="duration">Theo thời lượng</Option>
                  <Option value="count">Theo số đoạn</Option>
                </Select>
              </div>

              {videoInfo.multiType === "duration" && (
                <div>
                  <Text className="text-sm">Thời lượng mỗi đoạn (giây):</Text>
                  <InputNumber
                    value={videoInfo.segmentTime}
                    onChange={(value) =>
                      setVideoInfo((prev) => ({ ...prev, segmentTime: value }))
                    }
                    min={1}
                    max={3600}
                    className="w-full mt-1"
                    size="small"
                  />
                </div>
              )}

              {videoInfo.multiType === "count" && (
                <div>
                  <Text className="text-sm">Số đoạn:</Text>
                  <InputNumber
                    value={videoInfo.segmentCount}
                    onChange={(value) =>
                      setVideoInfo((prev) => ({ ...prev, segmentCount: value }))
                    }
                    min={2}
                    max={100}
                    className="w-full mt-1"
                    size="small"
                  />
                </div>
              )}
            </div>
          )}
        </Card>

        <Card size="small">
          <Title level={5} className="mb-3">⚙️ Cài đặt chất lượng</Title>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Tooltip title={showTooltips ? "Cắt không mất chất lượng" : ""}>
                <span className="text-sm">Cắt không mất chất lượng</span>
              </Tooltip>
              <Switch
                checked={videoInfo.lossless}
                onChange={(checked) =>
                  setVideoInfo((prev) => ({ ...prev, lossless: checked }))
                }
                size="small"
              />
            </div>
            <div className="flex items-center justify-between">
              <Tooltip title={showTooltips ? "Snap to keyframe để cắt nhanh hơn" : ""}>
                <span className="text-sm">Snap to keyframe</span>
              </Tooltip>
              <Switch
                checked={videoInfo.snapKeyframe}
                onChange={(checked) =>
                  setVideoInfo((prev) => ({ ...prev, snapKeyframe: checked }))
                }
                size="small"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Button
            type="primary"
            icon={<ScissorOutlined />}
            onClick={handleCutVideo}
            disabled={showNoFileNotice}
            block
            size="large"
          >
            Cắt Video
          </Button>
          <Button icon={<EyeOutlined />} disabled={showNoFileNotice} block>
            Xem trước
          </Button>
        </div>
      </div>
    )
  };

  const advancedTab = {
    key: 'advanced',
    label: 'Nâng cao',
    children: (
      <div className="space-y-4">
        {Object.entries(groupedOptions).map(([category, options]) => (
          <Card key={category} size="small">
            <Title level={5} className="mb-3 capitalize">
              {category === 'precision' && '🎯 Độ chính xác'}
              {category === 'ai' && '🤖 AI'}
              {category === 'audio' && '🔊 Âm thanh'}
              {category === 'enhancement' && '✨ Cải thiện'}
              {category === 'quality' && '💎 Chất lượng'}
              {category === 'performance' && '⚡ Hiệu suất'}
            </Title>
            <div className="space-y-3">
              {options.map((option) => (
                <div key={option.value} className="flex items-center justify-between">
                  <Tooltip title={showTooltips ? option.description : ""}>
                    <span className="text-sm">{option.label}</span>
                  </Tooltip>
                  <Switch
                    checked={videoInfo.advancedOptions[option.value] || false}
                    onChange={(checked) => handleAdvancedOptionChange(option.value, checked)}
                    size="small"
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    )
  };

  const statsTab = {
    key: 'stats',
    label: 'Thống kê',
    children: (
      <div className="space-y-4">
        {videoInfo.selectedFile ? (
          <>
            <Card size="small">
              <Title level={5} className="mb-3">📊 Thông tin video</Title>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Thời lượng:</span>
                  <span>{formatTime(videoState.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Độ phân giải:</span>
                  <span>{videoState.videoWidth}x{videoState.videoHeight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kích thước:</span>
                  <span>{(videoInfo.selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            </Card>

            <Card size="small">
              <Title level={5} className="mb-3">✂️ Thông tin cắt</Title>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Thời lượng đoạn cắt:</span>
                  <span>{formatTime(videoInfo.cutEnd - videoInfo.cutStart)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Từ:</span>
                  <span>{formatTime(videoInfo.cutStart)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Đến:</span>
                  <span>{formatTime(videoInfo.cutEnd)}</span>
                </div>
              </div>
            </Card>
          </>
        ) : (
          <Card size="small">
            <div className="text-center py-8">
              <Text type="secondary">Chưa có video nào được chọn</Text>
            </div>
          </Card>
        )}
      </div>
    )
  };

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        items={[basicTab, advancedTab, statsTab]}
      />
    </div>
  );
});

export default RightSidebar;
