import React, { useState } from 'react';
import Home from './components/Home';
import TabSwitcher from './components/TabSwitcher';
import Footer from './components/Footer';
import CutVideo from './components/CutVideo';
import MergeVideo from './components/MergeVideo';
import RemoveAudio from './components/RemoveAudio';
import AISubtitle from './components/AISubtitle';
import BatchProcessing from './components/BatchProcessing';
import TiktokYoutubePreset from './components/TiktokYoutubePreset';
import './index.css';
 
export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app">
      <div className="main-content">
        <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'home' && <Home />} 
         {activeTab === 'cutVideo' && <CutVideo />}
         {activeTab === 'mergeVideo' && <MergeVideo />}
         {activeTab === 'removeAudio' && <RemoveAudio />}
         {activeTab === 'aiSubtitle' && <AISubtitle />}
         {activeTab === 'batchProcessing' && <BatchProcessing />}
         {activeTab === 'tiktokYoutubePreset' && <TiktokYoutubePreset />}
        {/* Bạn có thể thêm các tab khác sau */}
      </div>
      <Footer />
    </div>
  );
}