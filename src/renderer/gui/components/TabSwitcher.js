import React from 'react';

export default function TabSwitcher({ activeTab, setActiveTab } ) {
   return  (
     <div className="tab-bar" >
       <button className={activeTab === 'home' ? 'active' : ''} onClick={()  => setActiveTab('home')}>
         🏠 Trang chủ 
       </button >
       {/* Các tab khác sẽ được thêm sau */}
     </div >
   );
 }