import React, { memo } from 'react';
import { Button, Tooltip } from 'antd';
import {
  FileAddOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';

const Header = memo(({ 
  theme, 
  toggleTheme, 
  selectFile, 
  selectSaveDirectory, 
  setShowSettings, 
  setShowShortcuts,
  showTooltips 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            🎬 Video Editor Pro
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Tooltip title={showTooltips ? "Chọn video" : ""} destroyOnHidden>
            <Button
              icon={<FileAddOutlined />}
              onClick={selectFile}
              type="primary"
              size="large"
            >
              Chọn Video
            </Button>
          </Tooltip>

          <Tooltip title={showTooltips ? "Chọn thư mục lưu" : ""} destroyOnHidden>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={selectSaveDirectory}
              size="large"
            >
              Thư mục lưu
            </Button>
          </Tooltip>

          <Tooltip title={showTooltips ? "Cài đặt" : ""} destroyOnHidden>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(true)}
              size="large"
            />
          </Tooltip>

          <Tooltip title={showTooltips ? "Phím tắt" : ""} destroyOnHidden>
            <Button
              icon={<QuestionCircleOutlined />}
              onClick={() => setShowShortcuts(true)}
              size="large"
            />
          </Tooltip>

          <Tooltip title={showTooltips ? (theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng') : ""} destroyOnHidden>
            <Button
              icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              size="large"
            />
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

export default Header;
