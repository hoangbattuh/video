import React from 'react';
import { Modal, Progress, Tag, Typography } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const ProgressModal = ({
  showProgressModal,
  theme,
  progress,
  processing,
  videoInfo
}) => (
  <Modal
    title={
      <div className="flex items-center">
        <ThunderboltOutlined className="mr-2 text-blue-500" />
        <span className={theme === 'dark' ? 'text-white' : 'text-blue-600'}>
          Đang xử lý video
        </span>
      </div>
    }
    open={showProgressModal}
    footer={null}
    closable={false}
    centered
    className={theme === 'dark' ? 'dark-modal ant-modal-dark' : ''}
  >
    <div className="text-center">
      <Progress
        percent={progress}
        status={processing ? "active" : "success"}
        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
        className="mb-4"
        format={percent => (
          <span className={theme === 'dark' ? 'text-white' : 'text-gray-800'}>
            {percent}%
          </span>
        )}
      />
      <div className="mb-4">
        <Text type="secondary" className="block mb-2">
          Vui lòng không tắt trình duyệt trong quá trình xử lý...
        </Text>
        <Text type="secondary" className="text-sm">
          Chế độ: {videoInfo.mode} | Thời lượng: {(videoInfo.cutEnd - videoInfo.cutStart).toFixed(1)}s
        </Text>
      </div>
      {processing && (
        <div className="flex justify-center space-x-2">
          <Tag color="processing">Đang xử lý</Tag>
          <Tag color="blue">{videoInfo.mode}</Tag>
          {videoInfo.lossless && <Tag color="green">Lossless</Tag>}
        </div>
      )}
    </div>
  </Modal>
);

ProgressModal.propTypes = {
  showProgressModal: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  processing: PropTypes.bool.isRequired,
  videoInfo: PropTypes.object.isRequired,
};

export default ProgressModal;
