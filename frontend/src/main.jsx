import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './views/Home'
import Trending from './views/Trending.jsx'
import Catscribers from './views/Catscribers'
import Education from './views/Education'
import You from './views/You'
import Studio from './views/Studio'
import YourChannel from './views/YourChannel.jsx'
import DiscoverPage from './views/DiscoverPage.jsx'
import { ModalProvider } from './views/components/modals/ModalContext.jsx'
import ModalRenderer from './views/components/modals/ModalRenderer.jsx'
import RegisterPage from './views/RegisterPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ModalProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<DiscoverPage></DiscoverPage>} />
        <Route path="/education" element={<Education/>} />
        <Route path="/trending" element={<Trending/>} /> 
        <Route path="/subscribers" element={<Catscribers/>} />
        <Route path="/you" element={<You/>} />
        <Route path="/history" element={<You/>} />
        <Route path="/playlist" element={<You/>} />
        <Route path="/view-later" element={<You/>} />
        <Route path="/liked" element={<You/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/studio" element={<Studio/>} />
        <Route path="/yourchannel" element={<YourChannel />} />
      </Routes>
      <ModalRenderer/>
      </ModalProvider>
    </Router>
  </StrictMode>,
)
