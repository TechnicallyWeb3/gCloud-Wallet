import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selfHandle, setSelfHandle] = useState('default_handle');

  function login(handle) {
    setSelfHandle(handle);
    console.log(handle); // Log the updated handle value
  }

  useEffect(() => {
    console.log(selfHandle); // Log the updated selfHandle value
    // window.location.href = `/profile?handle=${selfHandle}`;
  }, [selfHandle]); // Add selfHandle as a dependency

  return (
    <AppContext.Provider value={{ selfHandle, login }}>
      {children}
    </AppContext.Provider>
  );
};