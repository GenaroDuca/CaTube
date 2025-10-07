import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/HomePage/HomePage.jsx'
import Trending from './pages/TrendingPage/TrendingPage.jsx'
import Catscribers from './pages/CatscribersPage/CatscribersPage.jsx'
import Education from './pages/EducationPage/EducationPage.jsx'
import You from './pages/YouPage/YouPage.jsx'
import Studio from './pages/StudioPage/StudioPage.jsx'
import YourChannel from './pages/YourChannelPage/YourChannelPage.jsx'
import DiscoverPage from './pages/DiscoverPage/DiscoverPage.jsx'
import { ModalProvider } from './components/common/modal/ModalContext.jsx'
import ModalRenderer from './components/common/modal/ModalRenderer.jsx'
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx'

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
