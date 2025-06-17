import React, { memo } from 'react';
import { Button, Space, Tooltip, Dropdown } from 'antd';
import {
  FolderOpenOutlined,
  SaveOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  ExportOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';

const MergeVideoHeader = memo(({
  theme,
  currentMode,
  onModeChange,
  onImportFiles,
  onSaveProject,
  onExportVideo,
  onPreviewProject,
  setShowSettings,
  setShowHelp,
  toggleTheme,
  showTooltips
}) => {
  // Danh sách lựa chọn chế độ người dùng
  const modeItems = [
    {
      key: 'beginner',
      label: '🌱 Người mới bắt đầu',
    },
    {
      key: 'pro',
      label: '⚡ Chuyên nghiệp',
    },
    {
      key: 'expert',
      label: '🚀 Chuyên gia',
    },
  ];

  return (
    <div className={`h-16 border-b flex items-center justify-between px-4 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 text-white' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      {/* Logo và Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-blue-600">Video Merger Pro</h1>
        <Dropdown
          menu={{
            items: modeItems,
            selectable: true,
            selectedKeys: [currentMode],
            onClick: ({ key }) => onModeChange(key),
          }}
          placement="bottomLeft"
        >
          <Button type="text" className="text-sm">
            {currentMode === 'beginner' && '🌱 Cơ bản'}
            {currentMode === 'pro' && '⚡ Pro'}
            {currentMode === 'expert' && '🚀 Expert'}
          </Button>
        </Dropdown>
      </div>

      {/* Main Actions */}
      <Space size="middle">
        <Tooltip title={showTooltips ? "Nhập video để ghép" : ""}>
          <Button
            type="primary"
            icon={<FolderOpenOutlined />}
            onClick={onImportFiles}
          >
            Nhập Video
          </Button>
        </Tooltip>

        <Tooltip title={showTooltips ? "Xem trước kết quả" : ""}>
          <Button
            icon={<PlayCircleOutlined />}
            onClick={onPreviewProject}
          >
            Xem trước
          </Button>
        </Tooltip>

        <Tooltip title={showTooltips ? "Xuất video đã ghép" : ""}>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={onExportVideo}
            className="bg-green-600 hover:bg-green-700 border-green-600"
          >
            Xuất Video
          </Button>
        </Tooltip>
      </Space>

      {/* Settings & Tools */}
      <Space>
        <Tooltip title={showTooltips ? "Lưu dự án" : ""}>
          <Button
            icon={<SaveOutlined />}
            onClick={onSaveProject}
          />
        </Tooltip>

        <Tooltip title={showTooltips ? "Cài đặt" : ""}>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setShowSettings(true)}
          />
        </Tooltip>

        <Tooltip title={showTooltips ? "Trợ giúp" : ""}>
          <Button
            icon={<QuestionCircleOutlined />}
            onClick={() => setShowHelp(true)}
          />
        </Tooltip>

        <Tooltip title={showTooltips ? "Chuyển giao diện" : ""}>
          <Button
            icon={<BulbOutlined />}
            onClick={toggleTheme}
          />
        </Tooltip>
      </Space>
    </div>
  );
});

export default MergeVideoHeader;
