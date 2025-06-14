import React, { useState } from 'react' ;
 import Home from './components/Home' ;
 import TabSwitcher from './components/TabSwitcher' ;
 import Footer from './components/Footer' ;
 import './index.css' ;
 
 export default function App( ) {
   const [activeTab, setActiveTab] = useState('home' );
 
   return  (
     <div className="app" >
       <div className="main-content" >
         <TabSwitcher activeTab={activeTab} setActiveTab={setActiveTab}  />
         {activeTab === 'home' && <Home  />}
         {/* Bạn có thể thêm các tab khác sau */}
       </div >
       <Footer  />
     </div >
   );
 }