
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.jsx'

// PWA Registration
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a toast notification or modal to inform user about update
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // Show a toast notification that the app is ready for offline use
    console.log('App ready to work offline')
  },
})

createRoot(document.getElementById('root')).render(
<BrowserRouter>
<Provider store={store}>
  
    <App />

    
</Provider>
</BrowserRouter>



)

