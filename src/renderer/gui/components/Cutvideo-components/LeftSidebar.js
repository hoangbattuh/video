import React, { memo } from 'react';
import { Card, Typography, Tooltip } from 'antd';
import RecentFilesList from './RecentFilesList';
import './PresetPlatform.css';

const { Title, Text } = Typography;

const LeftSidebar = memo(({ 
  recentFiles, 
  handleFileSelect, 
  removeFile,
  platformPresets, 
  selectedPreset, 
  applyPreset, 
  showTooltips 
}) => {
  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
      {/* Recent Files */}
      <Card
        size="small"
        className="mb-4"
        styles={{
          body: {
            padding: '12px',
          },
        }}
      >
        <Title level={5} className="mb-3">
          📁 File gần đây
        </Title>
        <RecentFilesList
          recentFiles={recentFiles}
          handleFileSelect={handleFileSelect}
          removeFile={removeFile}
        />
      </Card>

      {/* Platform Presets */}
      <Card
        size="small"
        styles={{
          body: {
            padding: '12px',
          },
        }}
      >
        <Title level={5} className="mb-3">
          🎯 Preset nền tảng
        </Title>
        <div className="preset-container">
          {Object.entries(platformPresets).map(([key, preset]) => (
            <div key={key} className="preset-wrapper">
              <Tooltip 
                title={showTooltips ? preset.description : ""}
                placement="bottomLeft"
                mouseEnterDelay={0.5}
                styles={{
                  body: { 
                    maxWidth: 250,
                    padding: '8px 12px',
                    fontSize: '12px',
                    lineHeight: '1.5'
                  }
                }}
                color="#1f1f1f"
                destroyOnHidden
                arrow={false}
              >
                <div
                  className={`preset-item ${selectedPreset === key ? 'selected' : ''}`}
                  onClick={() => applyPreset(key)}
                  tabIndex={0}
                  role="button"
                >
                  <span className="preset-icon">{preset.icon}</span>
                  <div className="preset-info">
                    <span className="preset-title">{preset.name}</span>
                    <span className="preset-desc">
                      {preset.aspectRatio} • {preset.maxDuration}s
                    </span>
                  </div>
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

export default LeftSidebar;
