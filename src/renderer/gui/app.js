import React from 'react';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [activeTab, setActiveTab] = useState('trim');

  const renderContent = () => {
    switch (activeTab) {
      case 'trim':
        return <div>
                 <h2>🪓 Cắt Video</h2>
                 <p>Nội dung cho Tab Cắt Video sẽ ở đây.</p>
               </div>;
      case 'merge':
        return <div>
                 <h2>📎 Ghép Video</h2>
                 <p>Nội dung cho Tab Ghép Video sẽ ở đây.</p>
               </div>;
      case 'remove_audio':
        return <div>
                 <h2>🔇 Xóa Âm thanh</h2>
                 <p>Nội dung cho Tab Xóa Âm thanh sẽ ở đây.</p>
               </div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Video Editor Pro</h1>
      <nav style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveTab('trim')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: activeTab === 'trim' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'trim' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >🪓 Cắt Video</button>
        <button
          onClick={() => setActiveTab('merge')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: activeTab === 'merge' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'merge' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >📎 Ghép Video</button>
        <button
          onClick={() => setActiveTab('remove_audio')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: activeTab === 'remove_audio' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'remove_audio' ? 'white' : '#333',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >🔇 Xóa Âm thanh</button>
      </nav>
      <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', minHeight: '300px' }}>
        {activeTab === 'trim' && (
            <div className="tab-content">
                <h3>🪓 Cắt Video</h3>
                <div className="section">
                    <h4>Khu vực tải & xem trước:</h4>
                    <button>📂 Chọn Video</button>
                    <p>Tên tệp đã chọn: (Chưa có)</p>
                    {/* Trình phát video với thanh timeline sẽ được thêm sau */}
                    <p>Thời gian bắt đầu: 00:00</p>
                    <p>Thời gian kết thúc: 00:00</p>
                </div>

                <div className="section">
                    <h4>Chế độ cắt:</h4>
                    <div>
                        <label>Cắt theo số đoạn:</label>
                        <input type="number" placeholder="Số lượng đoạn" />
                        <button>Cắt theo số lượng</button>
                    </div>
                    <div>
                        <label>Cắt theo thời lượng:</label>
                        <input type="number" placeholder="Thời lượng mỗi đoạn (giây)" />
                        <button>Cắt theo thời lượng</button>
                    </div>
                    <div>
                        <button>✂ Cắt đoạn đã chọn</button>
                    </div>
                </div>

                <div className="section">
                    <h4>Khu vực lưu trữ & xuất video:</h4>
                    <button>📁 Chọn thư mục lưu</button>
                    <p>Đường dẫn thư mục đầu ra: (Chưa có)</p>
                    <button>🚀 Bắt đầu Cắt</button>
                </div>
            </div>
        )}
        {activeTab === 'merge' && (
                <div className="tab-content">
                    <h3>📎 Ghép Video</h3>
                    <div className="section">
                        <h4>Danh sách & sắp xếp video:</h4>
                        <button>📂 Thêm Video(s)</button>
                        <ul>
                            <li>Video 1 (tên, độ dài, kích thước)</li>
                            <li>Video 2 (tên, độ dài, kích thước)</li>
                            {/* Hỗ trợ kéo-thả để sắp xếp lại thứ tự sẽ được thêm sau */}
                        </ul>
                        <button>🗑 Xóa đã chọn</button>
                    </div>

                    <div className="section">
                        <h4>Tùy chọn ghép:</h4>
                        <label>
                            <input type="checkbox" /> Ghép ngẫu nhiên
                        </label>
                    </div>

                    <div className="section">
                        <h4>Khu vực lưu trữ & xuất video:</h4>
                        <button>📁 Chọn thư mục lưu</button>
                        <p>Đường dẫn thư mục đầu ra: (Chưa có)</p>
                        <button>🚀 Bắt đầu Ghép</button>
                    </div>
                </div>
            )}
        {activeTab === 'remove_audio' && (
                <div className="tab-content">
                    <h3>🔇 Xóa Âm thanh</h3>
                    <div className="section">
                        <h4>Tải & xem trước video:</h4>
                        <button>📂 Chọn Video</button>
                        <p>Tên tệp đã chọn: (Chưa có)</p>
                        {/* Trình phát video đơn giản sẽ được thêm sau */}
                    </div>

                    <div className="section">
                        <h4>Điều khiển:</h4>
                        <button>🔇 Xóa Âm thanh</button>
                    </div>

                    <div className="section">
                        <h4>Lưu & xuất:</h4>
                        <button>📁 Chọn thư mục lưu</button>
                        <p>Đường dẫn thư mục đầu ra: (Chưa có)</p>
                        <button>🚀 Bắt đầu Xử lý</button>
                    </div>
                </div>
            )}
      </div>
      <footer style={{ textAlign: 'center', marginTop: '30px', fontSize: '14px', color: '#777' }}>
        <p>Trạng thái: Sẵn sàng</p>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);