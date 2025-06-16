import React, { memo } from 'react';
import { Card, Typography, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ShortcutsModal = memo(({ showShortcuts, setShowShortcuts }) => {
  if (!showShortcuts) return null;

  const shortcuts = [
    { action: 'Phát/Tạm dừng', key: 'Space' },
    { action: 'Tua lại 10s', key: '←' },
    { action: 'Tua tới 10s', key: '→' },
    { action: 'Tăng âm lượng', key: '↑' },
    { action: 'Giảm âm lượng', key: '↓' },
    { action: 'Tắt/Bật tiếng', key: 'M' },
    { action: 'Toàn màn hình', key: 'F' },
    { action: 'Đặt điểm bắt đầu', key: 'I' },
    { action: 'Đặt điểm kết thúc', key: 'O' },
    { action: 'Cắt video', key: 'Ctrl + X' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-[500px]">
        <div className="flex items-center justify-between mb-4">
          <Title level={4} className="mb-0">
            ⌨️ Phím tắt
          </Title>
          <Button
            icon={<CloseOutlined />}
            onClick={() => setShowShortcuts(false)}
          />
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span>{shortcut.action}</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
});

export default ShortcutsModal;