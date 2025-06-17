import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Progress, Typography, Card, Tag } from 'antd';
import { ThunderboltOutlined, LoadingOutlined } from '@ant-design/icons';
import { formatTime } from '../../utils/formatTime';

const { Text, Title } = Typography;

const ProgressModal = ({
  showProgressModal,
  theme,
  progress,
  processing,
  videoInfo
}) => {
  const dark = theme === 'dark';

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ThunderboltOutlined className="mr-2 text-blue-500" />
          <span className={dark ? 'text-white' : 'text-blue-600'}>
            Đang xử lý video
          </span>
        </div>
      }
      open={showProgressModal}
      footer={null}
      closable={false}
      centered
      className={dark ? 'dark-modal ant-modal-dark' : ''}
    >
      <div className="text-center">
        <LoadingOutlined className="text-4xl text-blue-500 mb-4" />
        <Title level={4} className={`mb-4 ${dark ? 'text-white' : 'text-gray-800'}`}>
          Đang cắt video...
        </Title>

        <Progress
          percent={Math.round(progress * 100)}
          status={processing ? 'active' : 'success'}
          strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
          className="mb-4"
          format={percent => (
            <span className={dark ? 'text-white' : 'text-gray-800'}>
              {percent}%
            </span>
          )}
        />

        {videoInfo?.selectedFile && (
          <Card
            className={`mt-4 ${dark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}
            styles={{
              body: {
                backgroundColor: dark ? '#1f2937' : '#f9fafb',
                padding: 16,
              }
            }}
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text className={dark ? 'text-gray-300' : 'text-gray-600'}>File:</Text>
                <Text className={dark ? 'text-white' : 'text-gray-800'}>
                  {videoInfo.selectedFile.name}
                </Text>
              </div>

              <div className="flex justify-between">
                <Text className={dark ? 'text-gray-300' : 'text-gray-600'}>Thời gian cắt:</Text>
                <Text className={dark ? 'text-white' : 'text-gray-800'}>
                  {formatTime(videoInfo.cutStart)} - {formatTime(videoInfo.cutEnd)}
                </Text>
              </div>

              <div className="flex justify-between">
                <Text className={dark ? 'text-gray-300' : 'text-gray-600'}>Chế độ:</Text>
                <Text className={dark ? 'text-white' : 'text-gray-800'}>
                  {videoInfo.mode === 'single' ? 'Cắt đơn' :
                  videoInfo.mode === 'segments' ? 'Chia đoạn' : 'Loại bỏ đoạn'}
                </Text>
              </div>

              <div className="flex justify-between">
                <Text className={dark ? 'text-gray-300' : 'text-gray-600'}>Thời lượng:</Text>
                <Text className={dark ? 'text-white' : 'text-gray-800'}>
                  {(videoInfo.cutEnd - videoInfo.cutStart).toFixed(1)} giây
                </Text>
              </div>
            </div>
          </Card>
        )}

        {processing && (
          <div className="flex justify-center mt-4 space-x-2">
            <Tag color="processing">Đang xử lý</Tag>
            <Tag color="blue">{videoInfo.mode}</Tag>
            {videoInfo.lossless && <Tag color="green">Lossless</Tag>}
          </div>
        )}

        <Text className={`block mt-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          Vui lòng không tắt trình duyệt trong khi video đang được xử lý...
        </Text>
      </div>
    </Modal>
  );
};

ProgressModal.propTypes = {
  showProgressModal: PropTypes.bool.isRequired,
  theme: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  processing: PropTypes.bool.isRequired,
  videoInfo: PropTypes.shape({
    selectedFile: PropTypes.object,
    cutStart: PropTypes.number,
    cutEnd: PropTypes.number,
    mode: PropTypes.string,
    lossless: PropTypes.bool,
  }).isRequired,
};

export default ProgressModal;
