import { VITE_API_URL } from '../../../config';
import { useState, useMemo, useEffect } from 'react'

//Components
import { ChannelList } from '../../components/user/ChannelList.jsx'
import { VideoList } from '../../components/videoPageComponents/VideoList.jsx'
import { ShortList } from '../../components/shortPageComponents/ShortList.jsx'
import Header from '../../components/common/header/Header.jsx'
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer.jsx";

//Styles
import './SearchPage.css';

//Assets
import Angel from '../../assets/images/profile/angel.jpg'


export function Search() {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const searchTerm = sessionStorage.getItem('voiceSearchTerm');
    if (searchTerm) {
      sessionStorage.removeItem('voiceSearchTerm');
      setSearchQuery(searchTerm);
    }
  }, []);

  // Fetch channels from API
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/channels`);
        if (response.ok) {
          const data = await response.json();
          const transformedChannels = data.map(channel => {
            let avatar = Angel; // default fallback
            if (channel.photoUrl) {
              if (channel.photoUrl.startsWith('/uploads/')) {
                // Uploaded image
                avatar = `${VITE_API_URL}${channel.photoUrl}`;
              } else if (channel.photoUrl.startsWith('/assets/images/profile/')) {
                // Default image
                avatar = channel.photoUrl;
              } else if (channel.photoUrl.startsWith('/default-avatar/')) {
                // Old default avatar path
                const letterMatch = channel.photoUrl.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                avatar = `/assets/images/profile/${letter}.png`;
              } else {
                // Other uploaded path
                avatar = channel.photoUrl;
              }
            } else {
              // No photoUrl, use first letter of channel name
              const firstLetter = channel.channel_name?.charAt(0).toUpperCase() || 'A';
              avatar = `/assets/images/profile/${firstLetter}.png`;
            }

            // If avatar is a default path like /assets/images/profile/X.png, ensure it's served correctly
            if (avatar.startsWith('/assets/')) {
              avatar = avatar; // Already correct
            }

            return {
              id: channel.channel_id,
              avatar,
              userName: channel.channel_name,
              subscriptions: channel.subscriberCount || 0
            };
          });
          setChannels(transformedChannels);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoadingChannels(false);
      }
    };

    fetchChannels();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoadingVideos(true);
      try {
        const res = await fetch(`${VITE_API_URL}/videos`);
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();

        const mapped = data.map(v => {
          const thumbnail = v.thumbnail && v.thumbnail.startsWith('/') ? `${VITE_API_URL}${v.thumbnail}` : (v.thumbnail || '');
          let avatar = '/assets/images/profile/A.png'; // default
          if (v.channel?.photoUrl) {
            if (v.channel.photoUrl.startsWith('/uploads/')) {
              avatar = `${VITE_API_URL}${v.channel.photoUrl}`;
            } else if (v.channel.photoUrl.startsWith('/assets/images/profile/')) {
              avatar = v.channel.photoUrl;
            } else if (v.channel.photoUrl.startsWith('/default-avatar/')) {
              const letterMatch = v.channel.photoUrl.match(/\/default-avatar\/([A-Z])\.png/);
              const letter = letterMatch ? letterMatch[1] : 'A';
              avatar = `/assets/images/profile/${letter}.png`;
            } else {
              avatar = `${v.channel.photoUrl}`;
            }
          } else {
            // No photoUrl, use default image
            avatar = '/assets/images/profile/yukki.jpg';
          }

          return {
            id: v.id,
            thumbnail,
            avatar,
            title: v.title,
            userName: v.channel?.channel_name || 'Unknown',
            description: v.description || '',
            type: v.type || 'video'
          };
        });

        setVideos(mapped.filter(x => x.type === 'video' || !x.type));
        setShorts(mapped.filter(x => x.type === 'short'));
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos([]);
        setShorts([]);
      } finally {
        setLoadingVideos(false);
      }
    };

    fetchVideos();
  }, []);

  // use videos/shorts state fetched from backend

  // shorts state comes from backend fetch

  //filtros
  const lower = searchQuery.toLowerCase();
  const filteredChannels = channels.filter((ch) => ch.userName.toLowerCase().includes(lower));

  const filteredVideos = videos.filter((vd) =>
    vd.title.toLowerCase().includes(lower) ||
    vd.userName.toLowerCase().includes(lower)
  );

  const filteredShorts = shorts.filter((short) =>
    short.title.toLowerCase().includes(lower) ||
    short.userName.toLowerCase().includes(lower)
  );

  if (loadingChannels || loadingVideos) {
    return (
      <>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Sidebar />
        <main className="main-content">
          {/* Skeleton for Channels */}
          <section className="channel-section">
            <div style={{ width: '95%', margin: '1rem auto' }}>
              <div className="skeleton" style={{ width: '200px', height: '30px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '20px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {[...Array(4)].map((_, index) => (
                  <div key={index} style={{ display: 'flex', gap: '15px', padding: '15px', backgroundColor: 'var(--primary-color)', borderRadius: '20px' }}>
                    <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0e0e0', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '80%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '10px' }}></div>
                      <div className="skeleton" style={{ width: '60%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Skeleton for Videos */}
          <section className="video-section">
            <div style={{ width: '95%', margin: '1rem auto' }}>
              <div className="skeleton" style={{ width: '150px', height: '30px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '20px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {[...Array(6)].map((_, index) => (
                  <div key={index}>
                    <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#e0e0e0', borderRadius: '15px', marginBottom: '10px' }}></div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ width: '100%', height: '18px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                        <div className="skeleton" style={{ width: '70%', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Skeleton for Shorts */}
          <section className='short-section'>
            <div style={{ width: '95%', margin: '1rem auto' }}>
              <div className="skeleton" style={{ width: '150px', height: '30px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '20px' }}></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {[...Array(6)].map((_, index) => (
                  <div key={index}>
                    <div className="skeleton" style={{ width: '100%', aspectRatio: '9/16', backgroundColor: '#e0e0e0', borderRadius: '15px', marginBottom: '10px' }}></div>
                    <div className="skeleton" style={{ width: '100%', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                    <div className="skeleton" style={{ width: '70%', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <Footer footer="footer"></Footer>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Sidebar />
      <main className="main-content">
        <section className="channel-section">
          <ChannelList channels={filteredChannels} />
        </section>
        <section className="video-section">
          <VideoList videos={filteredVideos} />
        </section>
        <section className='short-section'>
          <ShortList shorts={filteredShorts} />
        </section>
        <Footer footer="footer"></Footer>
      </main>
    </>
  );
}

export default Search
