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
import { SidebarProvider } from './hooks/useSidebarToggle.jsx';
import { FriendMenu } from './components/common/friendMenu/friendMenu.jsx';
import { NotificationManager } from './components/common/Toasts/NotificationManager.jsx';
import ShortsPage from './pages/ShortPage/ShortsPage.jsx';
import { VideoPage } from './pages/VideoPage/VideoPage.jsx'
import  SuccessPage  from "./pages/VerificationEmailPage/SuccessPage.jsx"
import  ErrorPage  from './pages/VerificationEmailPage/ErrorPage.jsx';
import { ThemeProvider } from './components/context/themeContext.jsx';
import PlaylistDetail from './pages/PlaylistDetailPage/PlaylistDetail.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
    <Router>
      <SidebarProvider>
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
            <Route path="/playlist/:id" element={<PlaylistDetail />} />
            <Route path="/view-later" element={<You />} />
            <Route path="/liked" element={<You />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/studio" element={<Studio />} />
            <Route path="/yourchannel" element={<YourChannel />} />
            <Route path="/shorts" element={<ShortsPage />} />
            <Route path='/watch/:id' element={<VideoPage />} />

            <Route path="/verification-successful" element={<SuccessPage />} />
            <Route path="/verification-error" element={<ErrorPage />} />

          </Routes>

          <ModalRenderer />
          <FriendMenu/>
          <NotificationManager />

        </ModalProvider>
      </SidebarProvider>
    </Router>
    </ThemeProvider>
  </StrictMode>
);
