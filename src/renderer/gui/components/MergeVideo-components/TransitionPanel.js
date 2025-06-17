import React, { useState, useCallback } from 'react';
import { 
  Card, 
  Select, 
  Slider, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  Tooltip, 
  Collapse,
  InputNumber,
  Switch,
  Divider
} from 'antd';
import {
  PlayCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  ReloadOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  BgColorsOutlined,
  ScissorOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

const TransitionPanel = ({
  selectedClips = [],
  onApplyTransition,
  onPreviewTransition,
  theme = 'light',
  mode = 'beginner',
  showTooltips = true
}) => {
  const [transitionType, setTransitionType] = useState('fade');
  const [duration, setDuration] = useState(1.0);
  const [easing, setEasing] = useState('ease-in-out');
  const [direction, setDirection] = useState('left');
  const [intensity, setIntensity] = useState(50);
  const [customSettings, setCustomSettings] = useState({
    blur: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
    colorOverlay: '#000000',
    useColorOverlay: false
  });
  
  // Transition types with descriptions
  const transitionTypes = {
    beginner: [
      { value: 'fade', label: 'Mờ dần', description: 'Chuyển cảnh mờ dần đơn giản' },
      { value: 'cut', label: 'Cắt nhanh', description: 'Chuyển cảnh tức thì' },
      { value: 'slide', label: 'Trượt', description: 'Trượt từ trái sang phải' }
    ],
    pro: [
      { value: 'fade', label: 'Mờ dần', description: 'Chuyển cảnh mờ dần' },
      { value: 'cut', label: 'Cắt nhanh', description: 'Chuyển cảnh tức thì' },
      { value: 'slide', label: 'Trượt', description: 'Trượt theo hướng' },
      { value: 'wipe', label: 'Quét', description: 'Quét từ một hướng' },
      { value: 'zoom', label: 'Thu phóng', description: 'Thu phóng vào/ra' },
      { value: 'rotate', label: 'Xoay', description: 'Xoay chuyển cảnh' },
      { value: 'blur', label: 'Mờ', description: 'Làm mờ rồi rõ dần' }
    ],
    expert: [
      { value: 'fade', label: 'Mờ dần', description: 'Chuyển cảnh mờ dần' },
      { value: 'cut', label: 'Cắt nhanh', description: 'Chuyển cảnh tức thì' },
      { value: 'slide', label: 'Trượt', description: 'Trượt theo hướng' },
      { value: 'wipe', label: 'Quét', description: 'Quét từ một hướng' },
      { value: 'zoom', label: 'Thu phóng', description: 'Thu phóng vào/ra' },
      { value: 'rotate', label: 'Xoay', description: 'Xoay chuyển cảnh' },
      { value: 'blur', label: 'Mờ', description: 'Làm mờ rồi rõ dần' },
      { value: 'dissolve', label: 'Hòa tan', description: 'Hòa tan pixel' },
      { value: 'morph', label: 'Biến hình', description: 'Biến hình mượt mà' },
      { value: 'glitch', label: 'Nhiễu', description: 'Hiệu ứng nhiễu số' },
      { value: 'ripple', label: 'Gợn sóng', description: 'Hiệu ứng gợn sóng' },
      { value: 'shatter', label: 'Vỡ vụn', description: 'Vỡ thành mảnh' },
      { value: 'custom', label: 'Tùy chỉnh', description: 'Hiệu ứng tùy chỉnh' }
    ]
  };
  
  const easingTypes = [
    { value: 'linear', label: 'Tuyến tính' },
    { value: 'ease', label: 'Mượt' },
    { value: 'ease-in', label: 'Chậm đầu' },
    { value: 'ease-out', label: 'Chậm cuối' },
    { value: 'ease-in-out', label: 'Chậm hai đầu' },
    { value: 'bounce', label: 'Nảy' },
    { value: 'elastic', label: 'Đàn hồi' }
  ];
  
  const directions = {
    slide: [
      { value: 'left', label: 'Trái sang phải' },
      { value: 'right', label: 'Phải sang trái' },
      { value: 'up', label: 'Dưới lên trên' },
      { value: 'down', label: 'Trên xuống dưới' }
    ],
    wipe: [
      { value: 'left', label: 'Từ trái' },
      { value: 'right', label: 'Từ phải' },
      { value: 'up', label: 'Từ dưới' },
      { value: 'down', label: 'Từ trên' },
      { value: 'center', label: 'Từ giữa' }
    ],
    zoom: [
      { value: 'in', label: 'Phóng to' },
      { value: 'out', label: 'Thu nhỏ' }
    ]
  };
  
  const currentTransitions = transitionTypes[mode] || transitionTypes.beginner;
  const currentDirections = directions[transitionType] || [];
  
  const handleApplyTransition = useCallback(() => {
    if (selectedClips.length < 2) {
      return;
    }
    
    const transitionConfig = {
      type: transitionType,
      duration,
      easing,
      direction,
      intensity,
      customSettings: transitionType === 'custom' ? customSettings : undefined
    };
    
    onApplyTransition(transitionConfig);
  }, [selectedClips, transitionType, duration, easing, direction, intensity, customSettings, onApplyTransition]);
  
  const handlePreview = useCallback(() => {
    if (selectedClips.length < 2) {
      return;
    }
    
    const transitionConfig = {
      type: transitionType,
      duration,
      easing,
      direction,
      intensity,
      customSettings: transitionType === 'custom' ? customSettings : undefined
    };
    
    onPreviewTransition(transitionConfig);
  }, [selectedClips, transitionType, duration, easing, direction, intensity, customSettings, onPreviewTransition]);
  
  const handleCustomSettingChange = useCallback((key, value) => {
    setCustomSettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handleReset = useCallback(() => {
    setTransitionType('fade');
    setDuration(1.0);
    setEasing('ease-in-out');
    setDirection('left');
    setIntensity(50);
    setCustomSettings({
      blur: 0,
      scale: 1,
      rotation: 0,
      opacity: 1,
      colorOverlay: '#000000',
      useColorOverlay: false
    });
  }, []);
  
  const canApply = selectedClips.length >= 2;
  
  const collapseItems = [
    {
      key: 'advanced',
      label: 'Cài đặt nâng cao',
      children: (
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {/* Easing */}
          <div>
            <Text strong style={{ fontSize: 12 }}>Kiểu chuyển động</Text>
            <Select
              value={easing}
              onChange={setEasing}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
              disabled={!canApply}
            >
              {easingTypes.map(ease => (
                <Option key={ease.value} value={ease.value}>
                  {ease.label}
                </Option>
              ))}
            </Select>
          </div>
          
          {/* Intensity */}
          <div>
            <Text strong style={{ fontSize: 12 }}>Cường độ (%)</Text>
            <Slider
              min={0}
              max={100}
              value={intensity}
              onChange={setIntensity}
              disabled={!canApply}
              tooltip={{ formatter: (value) => `${value}%` }}
              style={{ marginTop: 4 }}
            />
          </div>
          
          {/* Custom Settings for Expert Mode */}
          {mode === 'expert' && transitionType === 'custom' && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <Text strong style={{ fontSize: 12 }}>Cài đặt tùy chỉnh</Text>
              
              {/* Blur */}
              <div>
                <Text style={{ fontSize: 11 }}>Độ mờ</Text>
                <Slider
                  min={0}
                  max={20}
                  value={customSettings.blur}
                  onChange={(value) => handleCustomSettingChange('blur', value)}
                  disabled={!canApply}
                  tooltip={{ formatter: (value) => `${value}px` }}
                />
              </div>
              
              {/* Scale */}
              <div>
                <Text style={{ fontSize: 11 }}>Tỷ lệ</Text>
                <Slider
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={customSettings.scale}
                  onChange={(value) => handleCustomSettingChange('scale', value)}
                  disabled={!canApply}
                  tooltip={{ formatter: (value) => `${value}x` }}
                />
              </div>
              
              {/* Rotation */}
              <div>
                <Text style={{ fontSize: 11 }}>Góc xoay</Text>
                <Slider
                  min={-360}
                  max={360}
                  value={customSettings.rotation}
                  onChange={(value) => handleCustomSettingChange('rotation', value)}
                  disabled={!canApply}
                  tooltip={{ formatter: (value) => `${value}°` }}
                />
              </div>
              
              {/* Color Overlay */}
              <div>
                <Space>
                  <Switch
                    checked={customSettings.useColorOverlay}
                    onChange={(checked) => handleCustomSettingChange('useColorOverlay', checked)}
                    disabled={!canApply}
                    size="small"
                  />
                  <Text style={{ fontSize: 11 }}>Lớp phủ màu</Text>
                </Space>
                {customSettings.useColorOverlay && (
                  <input
                    type="color"
                    value={customSettings.colorOverlay}
                    onChange={(e) => handleCustomSettingChange('colorOverlay', e.target.value)}
                    disabled={!canApply}
                    style={{ 
                      width: '100%', 
                      height: 24, 
                      border: 'none', 
                      borderRadius: 4,
                      marginTop: 4
                    }}
                  />
                )}
              </div>
            </>
          )}
        </Space>
      ),
      style: { 
        background: theme === 'dark' ? '#262626' : '#fafafa',
        border: 'none'
      }
    }
  ];

  return (
    <Card
      title={
        <Space>
          <ScissorOutlined />
          <span>Hiệu ứng chuyển cảnh</span>
        </Space>
      }
      size="small"
      styles={{
        body: { padding: 12 },
        header: { borderBottom: theme === 'dark' ? '1px solid #434343' : '1px solid #d9d9d9' }
      }}
      style={{
        background: theme === 'dark' ? '#1f1f1f' : '#fff',
        border: theme === 'dark' ? '1px solid #434343' : '1px solid #d9d9d9'
      }}
      extra={
        <Space>
          <Tooltip title="Xem trước" disabled={!showTooltips}>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={handlePreview}
              disabled={!canApply}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Đặt lại" disabled={!showTooltips}>
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="small"
            />
          </Tooltip>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Status */}
        {!canApply && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Chọn ít nhất 2 clip để áp dụng hiệu ứng chuyển cảnh
          </Text>
        )}
        
        {canApply && (
          <Text type="success" style={{ fontSize: 12 }}>
            Đã chọn {selectedClips.length} clip
          </Text>
        )}
        
        {/* Transition Type */}
        <div>
          <Text strong style={{ fontSize: 12 }}>Loại hiệu ứng</Text>
          <Select
            value={transitionType}
            onChange={setTransitionType}
            style={{ width: '100%', marginTop: 4 }}
            size="small"
            disabled={!canApply}
          >
            {currentTransitions.map(transition => (
              <Option key={transition.value} value={transition.value}>
                <Tooltip title={showTooltips ? transition.description : null}>
                  {transition.label}
                </Tooltip>
              </Option>
            ))}
          </Select>
        </div>
        
        {/* Duration */}
        <div>
          <Text strong style={{ fontSize: 12 }}>Thời lượng (giây)</Text>
          <Row gutter={8} style={{ marginTop: 4 }}>
            <Col span={16}>
              <Slider
                min={0.1}
                max={5.0}
                step={0.1}
                value={duration}
                onChange={setDuration}
                disabled={!canApply}
                tooltip={{ formatter: (value) => `${value}s` }}
              />
            </Col>
            <Col span={8}>
              <InputNumber
                min={0.1}
                max={5.0}
                step={0.1}
                value={duration}
                onChange={setDuration}
                disabled={!canApply}
                size="small"
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </div>
        
        {/* Direction */}
        {currentDirections.length > 0 && (
          <div>
            <Text strong style={{ fontSize: 12 }}>Hướng</Text>
            <Select
              value={direction}
              onChange={setDirection}
              style={{ width: '100%', marginTop: 4 }}
              size="small"
              disabled={!canApply}
            >
              {currentDirections.map(dir => (
                <Option key={dir.value} value={dir.value}>
                  {dir.label}
                </Option>
              ))}
            </Select>
          </div>
        )}
        
        {/* Advanced Settings */}
        {mode !== 'beginner' && (
          <Collapse 
            size="small" 
            ghost 
            items={collapseItems}
          />
        )}
        
        {/* Action Buttons */}
        <Row gutter={8} style={{ marginTop: 8 }}>
          <Col span={12}>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={handlePreview}
              disabled={!canApply}
              size="small"
              style={{ width: '100%' }}
            >
              Xem trước
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleApplyTransition}
              disabled={!canApply}
              size="small"
              style={{ width: '100%' }}
            >
              Áp dụng
            </Button>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default TransitionPanel;