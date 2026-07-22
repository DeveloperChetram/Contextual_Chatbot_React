import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

// 1. Create the Context
const SocketContext = createContext(null);

// 2. Create a custom hook so components can easily grab the socket
export const useSocket = () => {
  return useContext(SocketContext);
};

// 3. Create the Provider Component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  // Optional: If you need to know if the user is authenticated before connecting
  // const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`;
    const socketUrl = backendUrl.replace('/api', '');
    
    const token = localStorage.getItem('token');
    const actualToken = token && token !== 'google-auth-token' ? token : null;

    // Only connect if we have a token (or handle this based on your auth flow)
    if (actualToken) {
      const newSocket = io(socketUrl, {
        withCredentials: true,
        auth: { token: actualToken }, 
        extraHeaders: {
          'Authorization': `Bearer ${actualToken}`
        },
        transports: ['polling', 'websocket'], // Safe fallback
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

      // Cleanup on unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, []); // Empty dependency array means this only runs ONCE

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};