import React, { useState } from 'react';
import { useNavigate} from 'react-router-dom';

const SearchBar = ({ showInput, toggleSearchBar }) => {

  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState([]);
  const [address, setAddress] = useState('');

  const toggleSearch = () => {
    setSearchText('');
    setAddress('');
    toggleSearchBar();
  };

  const handleSearchClick = () => {
    if (showInput && searchText.trim() !== '') {
      navigate(`/profile?handle=${encodeURIComponent(searchText)}`);
      setSearchText('');
      toggleSearch()
      updateSearchHistory(searchText);
    } else {
      toggleSearch()
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    if (value.length >= 4) {
      setSearchText(value);
      logMatchingHistory(value);
      try {
        const response = await fetch(`https://identity-resolver-5ywm7t2p3a-pd.a.run.app/user?handle=${value}`);
        const data = await response.json();
        const isRegistered = data['linked-wallet'].isRegistered;
        const foundHandle = data['tiktok-user'].handle;
        if (isRegistered) {
          if (e.target.value === foundHandle) {
            const linkedAddress = data['linked-wallet'].address;
            showAddress(linkedAddress);
          }
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchText(value);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const updateSearchHistory = (searchQuery) => {
    setSearchHistory((prevHistory) => [searchQuery, ...prevHistory]);
  };

  const logMatchingHistory = (searchQuery) => {
    const matchingHistory = searchHistory.filter((entry) =>
      entry.startsWith(searchQuery)
    );
    console.log(matchingHistory);
  };

  const showAddress = (linkedAddress) => {
    setAddress(linkedAddress);
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div style={{ position: 'fixed', top: '20px', left: '20px', display: 'flex', alignItems: 'flex-start' }}>
    <button onClick={toggleSearch} style={{ alignSelf: 'flex-start' }}>
      {showInput ? 'X' : 'Search'}
    </button>
    
    {showInput && (
      <div style={{ marginLeft: '10px' }}>
          <form onSubmit={handleSearchClick}>
            <input
              type="text"
              value={searchText}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              list={searchText.length >= 4 ? 'searchHistoryList' : undefined}
            />
            {searchText.length >= 4 && (
              <datalist id="searchHistoryList">
                {searchHistory.map((query, index) => (
                  <option key={index} value={query} />
                ))}
              </datalist>
            )}
            <button type="submit">Search</button>
          </form>
          {address && (
            <div>
              <input
                type="text"
                value={address}
                readOnly
              />
              <button onClick={handleCopyClick}>
                Copy
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;