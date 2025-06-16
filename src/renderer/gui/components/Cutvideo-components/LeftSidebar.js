import React, { memo } from 'react';
import { Card, Typography, Button, Tooltip } from 'antd';
import RecentFilesList from './RecentFilesList';

const { Title, Text } = Typography;

const LeftSidebar = memo(({ 
  recentFiles, 
  handleFileSelect, 
  platformPresets, 
  selectedPreset, 
  applyPreset, 
  showTooltips 
}) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      {/* Recent Files */}
      <Card className="mb-4" size="small">
        <Title level={5} className="mb-3">
          📁 File gần đây
        </Title>
        <RecentFilesList
          files={recentFiles}
          onFileSelect={handleFileSelect}
          maxItems={5}
        />
      </Card>

      {/* Platform Presets */}
      <Card size="small">
        <Title level={5} className="mb-3">
          🎯 Preset nền tảng
        </Title>
        <div className="space-y-2">
          {Object.entries(platformPresets).map(([key, preset]) => (
            <Tooltip 
              key={key} 
              title={showTooltips ? preset.description : ""}
              placement="right"
            >
              <Button
                block
                size="small"
                type={selectedPreset === key ? "primary" : "default"}
                onClick={() => applyPreset(key)}
                className="text-left flex items-center justify-start"
              >
                <span className="mr-2">{preset.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs opacity-75">
                    {preset.aspectRatio} • {preset.maxDuration}s
                  </div>
                </div>
              </Button>
            </Tooltip>
          ))}
        </div>
      </Card>
    </div>
  );
});

export default LeftSidebar;