import React from 'react';

export default function TabSwitcher({ activeTab, setActiveTab } ) {
   return  (
     <div className="tab-bar" >
       <button className={activeTab === 'home' ? 'active' : ''} onClick={()  => setActiveTab('home')}>
         🏠 Trang chủ 
       </button >
       <button className={activeTab === 'cutVideo' ? 'active' : ''} onClick={() => setActiveTab('cutVideo')}>
         ✂️ Cắt Video
       </button>
       <button className={activeTab === 'mergeVideo' ? 'active' : ''} onClick={() => setActiveTab('mergeVideo')}>
         🔗 Ghép Video
       </button>
       <button className={activeTab === 'removeAudio' ? 'active' : ''} onClick={() => setActiveTab('removeAudio')}>
         🔇 Xóa Âm thanh
       </button>
       <button className={activeTab === 'aiSubtitle' ? 'active' : ''} onClick={() => setActiveTab('aiSubtitle')}>
         🧠 Phụ đề AI
       </button>
       <button className={activeTab === 'batchProcessing' ? 'active' : ''} onClick={() => setActiveTab('batchProcessing')}>
         🚀 Xử lý Hàng loạt
       </button>
       <button className={activeTab === 'tiktokYoutubePreset' ? 'active' : ''} onClick={() => setActiveTab('tiktokYoutubePreset')}>
         📱 Preset TikTok/YouTube
       </button>
       {/* Các tab khác sẽ được thêm sau */}
     </div >
   );
 }