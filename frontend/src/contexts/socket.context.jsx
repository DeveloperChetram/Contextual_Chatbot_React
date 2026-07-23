import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

// ─── Context ─────────────────────────────────────────────────────────────────
const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const reduxToken = useSelector((state) => state.auth.token);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // ── Wait for auth ──────────────────────────────────────────────────
    const activeToken = reduxToken || localStorage.getItem('token');

    if (!isAuthenticated) {
      console.log('⏳ Waiting for user to be authenticated...');
      return;
    }
    if (!activeToken) {
      console.warn('⚠️ User is authenticated in Redux, but no token string was found.');
      return;
    }

    console.log('🚀 User authenticated! Connecting socket...');

    // ── Pick the right URL for the environment ─────────────────────────
    // Production: connect DIRECTLY to Render (Vercel cannot proxy WebSocket)
    // Local: connect to local backend
    const BACKEND_ORIGIN = import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace('/api', '')
      : import.meta.env.PROD
        ? 'https://contextual-chatbot-react.onrender.com'
        : `http://${window.location.hostname}:3000`;

    // ── Create the socket ──────────────────────────────────────────────
    const newSocket = io(BACKEND_ORIGIN, {
      auth: { token: activeToken },
      withCredentials: true,
      // Polling-only in production (Vercel can't proxy WebSocket).
      // WebSocket is okay in local dev.
      transports: import.meta.env.PROD ? ['polling'] : ['polling', 'websocket'],
      allowEIO3: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // ── Connection lifecycle ───────────────────────────────────────────
    newSocket.on('connect', () => {
      console.log('✅ Global Socket connected:', newSocket.id);
      if (mountedRef.current) setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Global Socket disconnected:', reason);
      if (mountedRef.current) setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Global Socket connect error:', err.message);
      if (mountedRef.current) setConnected(false);
    });

    // Hack: Socket.IO polling doesn't always fire 'connect' on reconnect
    // after an initial connect-then-disconnect cycle. Watch the transport
    // via the open/close events as a fallback.
    newSocket.io.on('open', () => {
      if (mountedRef.current) setConnected(true);
    });
    newSocket.io.on('close', () => {
      if (mountedRef.current) setConnected(false);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.io.off('open');
      newSocket.io.off('close');
      newSocket.disconnect();
      if (mountedRef.current) {
        setSocket(null);
        setConnected(false);
      }
    };
  }, [isAuthenticated, reduxToken]);

  // Provide an object with both socket instance and connection state
  const value = { socket, connected };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};