import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MyWallet from './MyWallet';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="navbar">
      <button className="menu-icon" onClick={handleMenuClick}>
        <div className={isMenuOpen ? 'menu-line open' : 'menu-line'}></div>
        <div className={isMenuOpen ? 'menu-line open' : 'menu-line'}></div>
        <div className={isMenuOpen ? 'menu-line open' : 'menu-line'}></div>
      </button>
      {isMenuOpen && (
        <div className="menu">
          <Link to="/my-wallet" onClick={handleMenuClick}>
            My Wallet
          </Link>
        </div>
      )}
    </div>
  );
};

export default NavBar;