import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/App.css'; // Import the CSS file

const NavMenu = ({ showSearchMenu }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (showSearchMenu) {
    return null; // Hide the NavMenu when the search menu is open
  }

  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="nav-menu">
      <button onClick={toggleMenu}>
        Menu
      </button>
      {isOpen && (
        <ul className="dropdown-menu">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/landing">Connect</Link>
          </li>
          <li>
            <Link to="/send">Send</Link>
          </li>
        </ul>
      )}
    </div>
  );
};

export default NavMenu;