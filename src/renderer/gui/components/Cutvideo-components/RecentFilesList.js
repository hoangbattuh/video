import React from 'react';
import { Alert, List, Button, Avatar } from 'antd';
import { EyeOutlined, DeleteOutlined, VideoCameraOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const RecentFilesList = ({ recentFiles, handleFileSelect, removeFile }) => (
  recentFiles.length > 0 && (
    <Alert
      message="Files gần đây"
      description={
        <List
          size="small"
          dataSource={recentFiles}
          renderItem={file => (
            <List.Item
              key={file.id}
              actions={[
                <Button
                  key={`view-${file.id}`}
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    const mockFile = new File([], file.name, { type: file.type });
                    handleFileSelect({ file: mockFile });
                  }}
                />,
                <Button
                  key={`delete-${file.id}`}
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => removeFile(file.id)}
                />
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<VideoCameraOutlined />} />}
                title={file.name}
                description={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
              />
            </List.Item>
          )}
        />
      }
      type="info"
      showIcon
      className="mb-4"
    />
  )
);

RecentFilesList.propTypes = {
  recentFiles: PropTypes.array.isRequired,
  handleFileSelect: PropTypes.func.isRequired,
  removeFile: PropTypes.func.isRequired,
};

export default RecentFilesList;
