import React, { memo } from 'react';
import { Card, Typography, Tooltip } from 'antd';
import RecentFilesList from './RecentFilesList';
import styles from './PresetPlatform.module.css';

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
      <Card className="mb-4" size="small">
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
      <Card size="small">
        <Title level={5} className="mb-3">
          🎯 Preset nền tảng
        </Title>
        <div>
          {Object.entries(platformPresets).map(([key, preset]) => (
            <Tooltip 
              key={key} 
              title={showTooltips ? preset.description : ""}
              placement="right"
            >
              <div
                className={
                  styles['preset-item'] +
                  (selectedPreset === key ? ' ' + styles['selected'] : '')
                }
                onClick={() => applyPreset(key)}
                tabIndex={0}
                role="button"
                style={{ outline: 'none' }}
              >
                <span className={styles['preset-icon']}>{preset.icon}</span>
                <div className={styles['preset-info']}>
                  <span className={styles['preset-title']}>{preset.name}</span>
                  <span className={styles['preset-desc']}>
                    {preset.aspectRatio} • {preset.maxDuration}s
                  </span>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </Card>
    </div>
  );
});

export default LeftSidebar;