import React, { useState } from 'react'
import ShortCard from '../../components/shortPageComponents/ShortsCard'
import './shortsPage.css'
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import Short from '../../assets/videos/video-prueba2.mp4';
import channelAvatar from '../../assets/images/profile/angel.jpg';

const exampleShorts = [
  {
    id: 'local-1',
    videoSrc: Short,
    channelAvatar: channelAvatar,
    channelName: 'Angel',
    description: 'Funny cars crossing bollard',
    title: 'Funny Cars Crossing Bollard',
    isOwner: false,
    isSubscribed: false
  },
]

export default function ShortPage() {
  const [maximizedId, setMaximizedId] = useState(null)

  function handleMaximize(id) {
    setMaximizedId(id)
  }

  return (
    <>
      <Header></Header>
      <Sidebar></Sidebar>
      <main className="main-content" style={{ padding: 20 }}>
        <div className="container-short-principal" aria-live="polite">
          {exampleShorts.map((s) => (
            <ShortCard
              key={s.id}
              short={s}
              isMaximized={maximizedId === s.id}
              onToggleMaximize={() => handleMaximize(maximizedId === s.id ? null : s.id)}
            />
          ))}
        </div>
        <Footer footer="footer"></Footer>

      </main>
    </>
  )
}