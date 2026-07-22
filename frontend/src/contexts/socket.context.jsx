import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

// 1. Create the Context
const SocketContext = createContext(null);

// 2. Ignore the Vite warning
// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  return useContext(SocketContext);
};

// 3. Create the Provider Component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // We only care if the app considers the user logged in. 
  // The browser will handle the cookie securely!
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // If Redux says we aren't logged in yet, wait.
    if (!isAuthenticated) {
      console.log('⏳ Waiting for user to be authenticated...');
      return;
    }

    console.log('🚀 User authenticated! Connecting socket with HttpOnly cookies...');

    const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`;
    const socketUrl = backendUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      // 🛑 THIS is the magic flag. It tells the browser to attach the HttpOnly cookie.
      withCredentials: true, 
      // 🛑 Polling MUST be first for cross-origin cookies to attach during the handshake.
      transports: ['polling', 'websocket'], 
      allowEIO3: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Global Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Global Socket error:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]); 

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};