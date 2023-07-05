import React, {useState, useEffect} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './css/App.css';
import {AppProvider} from './AppContext.js'; // Import the AppProvider from AppContext.js
import Profile from './components/Profile.js';
import Send from './components/Send.js';
import NavMenu from './components/NavMenu.js';
import SearchBar from './components/SearchBar.js';
import Landing from './components/Landing.js';
import Home from './components/Home.js';


function App() {
  const [showInput, setShowInput] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showNav, setShowNav] = useState(windowWidth >= 550);

  const toggleSearchBar = () => {
    setShowInput(!showInput);
    if (!showNav) {
      setShowNav(showInput);
   }
 };

  const handleResize = () => {
    const newWidth = window.innerWidth;
    setWindowWidth(newWidth);
    if (newWidth >= 550) {
      setShowNav(true);
   } else {
      if (showInput) {
        setShowNav(false);
     } else {
        setShowNav(true);
     }
   }
 };

  useEffect(() => {
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
   };
 }, []);

  return (
    <AppProvider> {/* Wrap the entire app with the AppProvider */}
      <Router>
        <div className="App">
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <SearchBar showInput={showInput} toggleSearchBar={toggleSearchBar} />
            {!showInput && <NavMenu />}
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/send" element={<Send />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
