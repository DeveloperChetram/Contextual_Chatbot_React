import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useSelector } from 'react-redux';
import { getCharacterAccentColor } from '../utils/pwaThemeUpdater';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  
  // Get current character for dynamic theming
  const { character } = useSelector((state) => state.chat);

  // Get character-specific accent color
  const characterAccentColor = getCharacterAccentColor(character);

  const {
    offlineReady: [offlineReadySW, setOfflineReadySW],
    needRefresh: [needRefreshSW, setNeedRefreshSW],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    setOfflineReady(offlineReadySW);
  }, [offlineReadySW]);

  useEffect(() => {
    setNeedRefresh(needRefreshSW);
  }, [needRefreshSW]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdateClick = () => {
    updateServiceWorker(true);
    setNeedRefresh(false);
  };

  const handleOfflineReady = () => {
    setOfflineReady(false);
    setOfflineReadySW(false);
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && deferredPrompt && (
        <div className="pwa-install-prompt">
          <div className="pwa-install-content">
            <div className="pwa-install-icon">
              <img src="/src/assets/logo.webp" alt="Atomic" />
            </div>
            <div className="pwa-install-text">
              <div className="pwa-install-title">Install Atomic</div>
              <div className="pwa-install-subtitle">Get quick access and better experience</div>
            </div>
            <div className="pwa-install-buttons">
              <button 
                className="pwa-install-btn pwa-install-btn-primary" 
                onClick={handleInstallClick}
                style={{ '--character-accent': characterAccentColor }}
              >
                Install
              </button>
              <button 
                className="pwa-install-btn pwa-install-btn-secondary" 
                onClick={() => setShowInstallPrompt(false)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Available */}
      {needRefresh && (
        <div className="pwa-update-prompt">
          <div className="pwa-update-content">
            <div className="pwa-update-icon">🔄</div>
            <div className="pwa-update-text">
              <div className="pwa-update-title">Update Available</div>
              <div className="pwa-update-subtitle">New version is ready</div>
            </div>
            <div className="pwa-update-buttons">
              <button 
                className="pwa-update-btn pwa-update-btn-primary" 
                onClick={handleUpdateClick}
                style={{ '--character-accent': characterAccentColor }}
              >
                Update
              </button>
              <button 
                className="pwa-update-btn pwa-update-btn-secondary" 
                onClick={() => setNeedRefresh(false)}
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Ready */}
      {offlineReady && (
        <div className="pwa-offline-prompt">
          <div className="pwa-offline-content">
            <div className="pwa-offline-icon">✅</div>
            <div className="pwa-offline-text">
              <div className="pwa-offline-title">Ready for Offline</div>
              <div className="pwa-offline-subtitle">App works without internet</div>
            </div>
            <button 
              className="pwa-offline-btn" 
              onClick={handleOfflineReady}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
