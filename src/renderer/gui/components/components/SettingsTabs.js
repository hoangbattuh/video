import React from 'react';
import { Tabs, Radio, Space, InputNumber, Switch, Typography } from 'antd';
import { FolderOpenOutlined, DownloadOutlined, StarOutlined, ThunderboltOutlined, RobotOutlined, RocketOutlined, AudioOutlined, PictureOutlined, CheckOutlined, CloseOutlined, MoonOutlined, SunOutlined, SettingsOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
const { Title, Text } = Typography;

const SettingsTabs = ({
  activeTab,
  setActiveTab,
  theme,
  videoInfo,
  handleModeChange,
  handleAdvancedOptionChange,
  setVideoInfo,
  saveDir,
  autoSave,
  setAutoSave,
  showTooltips,
  setShowTooltips,
  advancedOptions,
  getOptionDescription,
  groupedOptions,
  toggleTheme
}) => (
  <Tabs
    activeKey={activeTab}
    onChange={setActiveTab}
    className={`custom-tabs ${theme === 'dark' ? 'dark-tabs' : ''}`}
    items={[
      {
        key: 'basic',
        label: (
          <span className="font-medium flex items-center">
            <SettingsOutlined className="mr-2" />
            Cắt cơ bản
          </span>
        ),
        children: (
          <div className="space-y-4">
            {/* ...các thành phần cắt cơ bản... */}
          </div>
        )
      },
      {
        key: 'advanced',
        label: (
          <span className="font-medium flex items-center">
            <RobotOutlined className="mr-2" />
            Nâng cao
          </span>
        ),
        children: (
          <div className="space-y-4">
            {/* ...các thành phần nâng cao... */}
          </div>
        )
      }
    ]}
  />
);

SettingsTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  videoInfo: PropTypes.object.isRequired,
  handleModeChange: PropTypes.func.isRequired,
  handleAdvancedOptionChange: PropTypes.func.isRequired,
  setVideoInfo: PropTypes.func.isRequired,
  saveDir: PropTypes.string.isRequired,
  autoSave: PropTypes.bool.isRequired,
  setAutoSave: PropTypes.func.isRequired,
  showTooltips: PropTypes.bool.isRequired,
  setShowTooltips: PropTypes.func.isRequired,
  advancedOptions: PropTypes.object.isRequired,
  getOptionDescription: PropTypes.func.isRequired,
  groupedOptions: PropTypes.array.isRequired,
  toggleTheme: PropTypes.func.isRequired,
};

export default SettingsTabs;
