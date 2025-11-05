import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Páginas
import Home from './pages/HomePage/HomePage.jsx'
import Trending from './pages/TrendingPage/TrendingPage.jsx'
import Catscribers from './pages/CatscribersPage/CatscribersPage.jsx'
import Education from './pages/EducationPage/EducationPage.jsx'
import You from './pages/YouPage/YouPage.jsx'
import Studio from './pages/StudioPage/StudioPage.jsx'
import YourChannel from './pages/YourChannelPage/YourChannelPage.jsx'
import DiscoverPage from './pages/DiscoverPage/DiscoverPage.jsx'
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx'
import ShortsPage from './pages/ShortPage/ShortsPage.jsx'
import { VideoPage } from './pages/VideoPage/VideoPage.jsx'
import SuccessPage from "./pages/VerificationEmailPage/SuccessPage.jsx"
import ErrorPage from './pages/VerificationEmailPage/ErrorPage.jsx';
import { Search } from './pages/SearchPage/SearchPage.jsx'

// Providers y Componentes Globales
import { ModalProvider } from './components/common/modal/ModalContext.jsx'
import ModalRenderer from './components/common/modal/ModalRenderer.jsx'
import { SidebarProvider } from './hooks/useSidebarToggle.jsx';
import { FriendMenu } from './components/common/friendMenu/FriendMenu.jsx';
import { ToastManager } from './components/common/toast/ToastManager.jsx';
import { NotificationProvider } from './hooks/useNotification.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <SidebarProvider>
        <NotificationProvider>
          <ModalProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/education" element={<Education />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/subscribers" element={<Catscribers />} />
              <Route path="/you" element={<You />} />
              <Route path="/history" element={<You />} />
              <Route path="/playlist" element={<You />} />
              <Route path="/view-later" element={<You />} />
              <Route path="/liked" element={<You />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/yourchannel/:url?" element={<YourChannel />} />
              <Route path="/shorts" element={<ShortsPage />} />
              <Route path='/watch/:id' element={<VideoPage />} />
              <Route path="/verification-successful" element={<SuccessPage />} />
              <Route path="/verification-error" element={<ErrorPage />} />
              <Route path='/Search' element={<Search />} />
            </Routes>

            <ModalRenderer />
            <FriendMenu />
            <ToastManager />

          </ModalProvider>
        </NotificationProvider>
      </SidebarProvider>
    </Router>
  </StrictMode>
);