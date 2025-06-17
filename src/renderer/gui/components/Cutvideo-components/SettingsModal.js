import React, { memo } from 'react';
import { Card, Typography, Switch, Select, Tabs, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SettingsModal = memo(({ 
  showSettings,
  setShowSettings,
  theme,
  toggleTheme,
  autoSave,
  setAutoSave,
  showTooltips,
  setShowTooltips,
  saveSettings,
  resetSettings,
  groupedOptions,
  videoInfo,
  handleAdvancedOptionChange
}) => {
  if (!showSettings) return null;

  const tabsItems = [
    {
      key: 'ai',
      label: 'Tùy chọn AI',
      children: (
        <div className="space-y-4">
          {Object.entries(groupedOptions).map(([category, options]) => (
            <div key={category}>
              <Title level={5} className="mb-3 capitalize">
                {category === 'precision' && '🎯 Độ chính xác'}
                {category === 'ai' && '🤖 AI'}
                {category === 'audio' && '🔊 Âm thanh'}
                {category === 'enhancement' && '✨ Cải thiện'}
                {category === 'quality' && '💎 Chất lượng'}
                {category === 'performance' && '⚡ Hiệu suất'}
              </Title>
              {options.map((option) => (
                <div key={option.value} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  <Switch
                    checked={videoInfo.advancedOptions[option.value] || false}
                    onChange={(checked) => handleAdvancedOptionChange(option.value, checked)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'ui',
      label: 'Giao diện',
      children: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Chế độ tối</span>
            <Switch checked={theme === "dark"} onChange={toggleTheme} />
          </div>
          <div className="flex items-center justify-between">
            <span>Tự động lưu</span>
            <Switch checked={autoSave} onChange={setAutoSave} />
          </div>
          <div className="flex items-center justify-between">
            <span>Hiển thị tooltip</span>
            <Switch checked={showTooltips} onChange={setShowTooltips} />
          </div>
        </div>
      )
    },
    {
      key: 'export',
      label: 'Xuất video',
      children: (
        <div className="space-y-4">
          <div>
            <Text strong>Định dạng xuất:</Text>
            <Select defaultValue="mp4" className="w-full mt-2">
              <Option value="mp4">MP4 (H.264)</Option>
              <Option value="webm">WebM</Option>
              <Option value="avi">AVI</Option>
              <Option value="mov">MOV</Option>
            </Select>
          </div>
          <div>
            <Text strong>Chất lượng:</Text>
            <Select defaultValue="high" className="w-full mt-2">
              <Option value="low">Thấp (Nhanh)</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="high">Cao (Chậm)</Option>
              <Option value="lossless">Không mất chất lượng</Option>
            </Select>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card
        className="w-[800px] max-h-[80vh] overflow-y-auto"
        styles={{ body: { padding: 24 } }}
      >
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">
            ⚙️ Cài đặt nâng cao
          </Title>
          <Button
            icon={<CloseOutlined />}
            onClick={() => setShowSettings(false)}
          />
        </div>

        <Tabs defaultActiveKey="ai" type="card" items={tabsItems} />

        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
          <Button onClick={resetSettings}>Khôi phục mặc định</Button>
          <Button type="primary" onClick={saveSettings}>
            Lưu cài đặt
          </Button>
        </div>
      </Card>
    </div>
  );
});

export default SettingsModal;
