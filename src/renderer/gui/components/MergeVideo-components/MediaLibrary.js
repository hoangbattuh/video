import React, { memo, useState } from 'react';
import { Card, List, Button, Upload, Space, Tag, Tooltip, Input, Select, Avatar } from 'antd';
import {
  VideoCameraOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';

const { Search } = Input;
const { Option } = Select;

const MediaLibrary = memo(({
  videoFiles,
  onAddFiles,
  onRemoveFile,
  onPreviewFile,
  onDragStart,
  currentMode,
  theme,
  showTooltips
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Lọc và sắp xếp files
  const filteredFiles = videoFiles
    .filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || file.type.includes(filterType);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'duration':
          return (b.duration || 0) - (a.duration || 0);
        case 'date':
          return new Date(b.lastModified) - new Date(a.lastModified);
        default:
          return 0;
      }
    });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoTypeTag = (type) => {
    if (type.includes('mp4')) return <Tag color="blue">MP4</Tag>;
    if (type.includes('avi')) return <Tag color="green">AVI</Tag>;
    if (type.includes('mov')) return <Tag color="purple">MOV</Tag>;
    if (type.includes('mkv')) return <Tag color="orange">MKV</Tag>;
    return <Tag color="default">VIDEO</Tag>;
  };

  return (
    <div className={`w-80 border-r p-4 overflow-y-auto ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <Card 
        title="📁 Thư viện Video" 
        size="small"
        className="mb-4"
        extra={
          <Upload
            multiple
            accept="video/*"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={onAddFiles}
          >
            <Button 
              type="primary" 
              size="small" 
              icon={<PlusOutlined />}
            >
              Thêm
            </Button>
          </Upload>
        }
      >
        {/* Search và Filter */}
        {currentMode !== 'beginner' && (
          <Space direction="vertical" className="w-full mb-4">
            <Search
              placeholder="Tìm kiếm video..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              size="small"
            />
            
            <Space className="w-full">
              <Select
                value={filterType}
                onChange={setFilterType}
                size="small"
                style={{ width: 100 }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả</Option>
                <Option value="mp4">MP4</Option>
                <Option value="avi">AVI</Option>
                <Option value="mov">MOV</Option>
                <Option value="mkv">MKV</Option>
              </Select>
              
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="small"
                style={{ width: 100 }}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="name">Tên</Option>
                <Option value="size">Kích thước</Option>
                <Option value="duration">Thời lượng</Option>
                <Option value="date">Ngày</Option>
              </Select>
            </Space>
          </Space>
        )}

        {/* Danh sách Video */}
        <List
          size="small"
          dataSource={filteredFiles}
          locale={{ emptyText: 'Chưa có video nào. Nhấn "Thêm" để bắt đầu.' }}
          renderItem={(file, index) => (
            <List.Item
              key={file.id || index}
              className="cursor-move hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
              draggable
              onDragStart={(e) => onDragStart(e, file, index)}
              actions={[
                <Tooltip key="preview" title={showTooltips ? "Xem trước" : ""}>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => onPreviewFile(file)}
                  />
                </Tooltip>,
                <Tooltip key="delete" title={showTooltips ? "Xóa" : ""}>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveFile(file.id || index)}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={<VideoCameraOutlined />} 
                    className="bg-blue-500"
                  />
                }
                title={
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium truncate" title={file.name}>
                      {file.name}
                    </span>
                    {getVideoTypeTag(file.type)}
                  </div>
                }
                description={
                  <div className="text-xs text-gray-500">
                    <div>{formatFileSize(file.size)}</div>
                    {currentMode !== 'beginner' && (
                      <div>
                        {formatDuration(file.duration)} • {file.width}x{file.height}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Thống kê nhanh */}
      {currentMode !== 'beginner' && videoFiles.length > 0 && (
        <Card size="small" title="📊 Thống kê">
          <div className="text-sm space-y-1">
            <div>Tổng video: <strong>{videoFiles.length}</strong></div>
            <div>Tổng dung lượng: <strong>
              {formatFileSize(videoFiles.reduce((sum, file) => sum + file.size, 0))}
            </strong></div>
            <div>Tổng thời lượng: <strong>
              {formatDuration(videoFiles.reduce((sum, file) => sum + (file.duration || 0), 0))}
            </strong></div>
          </div>
        </Card>
      )}
    </div>
  );
});

export default MediaLibrary;