import React, { createContext, useState } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false);

  return (
    <NotificationContext.Provider value={{ hasUnseenMessages, setHasUnseenMessages }}>
      {children}
    </NotificationContext.Provider>
  );
}; 