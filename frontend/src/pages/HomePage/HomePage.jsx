import './HomePage.css'
import '../../styles/Global_components.css'
import Ads from '../../components/homePageComponents/Ads.jsx'
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer.jsx";
import VideosContainer from '../../components/homePageComponents/VideosContainer.jsx'
import SectionsCarousel from '../../components/homePageComponents/SectionsCarousel.jsx'
import TopSectionWrapper from '../../components/homePageComponents/TopSectionWrapper.jsx'
import OfficialSection from '../../components/homePageComponents/OfficialSection.jsx'
import Header from '../../components/common/header/Header.jsx'
import { useRef, useState, useEffect } from 'react';
import { getAuthToken } from "../../utils/auth";
import { VITE_API_URL } from '../../../config';

function Home() {
  const [channels, setChannels] = useState([]);
  const [recentChannels, setRecentChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const popularChannelsRef = useRef(null);
  const catsRef = useRef(null);
  const shortsRef = useRef(null);

  const token = getAuthToken();

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/channels`);
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data = await response.json();

        // Transform channels to match Profile component props
        const transformedChannels = data.map(channel => ({
          name: channel.channel_name,
          subs: channel.subscriberCount,
          photo: channel.photoUrl?.startsWith('http') ? channel.photoUrl : VITE_API_URL + channel.photoUrl,
          url: channel.url,
          channel_date: channel.channel_date,
          handle: '@' + channel.url,
          user_type: channel.user?.user_type, // Include user_type for filtering
        }));

        // Sort channels by subscriber count in descending order (Popular Channels)
        const sortedBySubscribers = [...transformedChannels].sort((a, b) => b.subs - a.subs);
        setChannels(sortedBySubscribers);

        // Sort channels by creation date (Recent Channels) - más reciente primero
        // Filtrar canales de admin antes de ordenar
        const nonAdminChannels = transformedChannels.filter(channel => channel.user_type !== 'admin');

        const sortedByDate = [...nonAdminChannels].sort((a, b) => {
          const dateA = new Date(a.channel_date);
          const dateB = new Date(b.channel_date);
          const diff = dateB - dateA;
          return diff;
        });

        setRecentChannels(sortedByDate);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${VITE_API_URL}/videos`, {
          method: 'GET',
          headers: headers,
        })
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        // Filter out shorts, only include videos with type 'video'
        const videosOnly = data.filter(video => video.type === 'video');
        // Transform videos to match Video component props
        const transformedVideos = videosOnly.map(video => ({
          id: video.id,
          title: video.title,
          namevideo: video.title,
          videoviews: `${video.views || 0} views`,
          views: video.views || 0,
          thumbnail: `${video.thumbnail}`,
          channel: video.channel,
          channel_name: video.channel?.channel_name || 'Unknown',
          channel_date: video.channel_date,
          createdAt: video.createdAt,
        }));
        setVideos(transformedVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos([]); // Si hay error, usar array vacío para no romper la UI
      }
    };

    const fetchShorts = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${VITE_API_URL}/videos/shorts`, {
          method: 'GET',
          headers: headers,
        });
        if (!response.ok) {
          throw new Error('Failed to fetch shorts');
        }
        const data = await response.json();
        // Transform shorts to match Short component props
        const transformedShorts = data.map(short => ({
          id: short.id,
          nameshort: short.title,
          shortviews: `${short.views || 0} views`,
          thumbnail: `${short.thumbnail}`,
          createdAt: short.createdAt,
        }));

        setShorts(transformedShorts);
      } catch (err) {
        console.error('Error fetching shorts:', err);
        setShorts([]); // Si hay error, usar array vacío para no romper la UI
      }
    };

    fetchChannels();
    fetchVideos();
    fetchShorts();
  }, [token]);

  if (loading) {
    return (
      <>
        <Header></Header>
        <Sidebar />
        <main className="main-content">
          {/* Skeleton for Popular Channels Podium */}
          <div className="title-container">
            <div className="skeleton" style={{ width: '250px', height: '35px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
          </div>
          <div className="podium-container" style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px', backgroundColor: 'var(--primary-color)', borderRadius: '30px', margin: '1rem auto', width: '95%' }}>
            {[...Array(3)].map((_, index) => (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e0e0e0' }}></div>
                <div className="skeleton" style={{ width: '100px', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '80px', height: '15px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>

          {/* Skeleton for Trending Section */}
          <div className="title-container">
            <div className="skeleton" style={{ width: '200px', height: '35px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '20px' }}></div>
          </div>
          <div style={{ width: '95%', margin: '1rem auto', backgroundColor: 'var(--primary-color)', borderRadius: '30px', padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[...Array(4)].map((_, index) => (
                <div key={index}>
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#e0e0e0', borderRadius: '15px', marginBottom: '10px' }}></div>
                  <div className="skeleton" style={{ width: '100%', height: '20px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                  <div className="skeleton" style={{ width: '70%', height: '15px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton for Recent Channels */}
          <div className="title-container">
            <div className="skeleton" style={{ width: '220px', height: '35px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '20px' }}></div>
          </div>
          <div style={{ width: '95%', margin: '1rem auto', backgroundColor: 'var(--primary-color)', borderRadius: '30px', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
              {[...Array(6)].map((_, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '100px' }}>
                  <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#e0e0e0' }}></div>
                  <div className="skeleton" style={{ width: '90px', height: '15px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton for Video Recommendations */}
          <div className="title-container">
            <div className="skeleton" style={{ width: '180px', height: '35px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginTop: '20px' }}></div>
          </div>
          <div style={{ width: '95%', margin: '1rem auto' }}>
            <div className="recommendations-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {[...Array(8)].map((_, index) => (
                <div key={index}>
                  <div className="skeleton" style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#e0e0e0', borderRadius: '15px', marginBottom: '10px' }}></div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e0e0e0', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div className="skeleton" style={{ width: '100%', height: '18px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                      <div className="skeleton" style={{ width: '60%', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* <Footer footer="footer" ></Footer> */}
        </main>
      </>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Header></Header>
      <Sidebar />
      <main className="main-content">
        {/* <Ads /> */}
        <SectionsCarousel section="popular-channels" subtitle="Recent Channels" ref={popularChannelsRef} render={recentChannels} type="profile" cts="carousel-cts" ></SectionsCarousel>

        <SectionsCarousel section="trending" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></SectionsCarousel>
        {/* <Sections section="subscriptions" subtitle="Catscribers" ref={catsRef} render={videos} type="video" cts="carousel-ctsvideos"></Sections> */}

        <div className="official-channels-section-container">
          <TopSectionWrapper channels={channels} videos={videos} />
          <OfficialSection />
        </div>


        <VideosContainer />

        {/* <Ads /> */}

        {/* <Footer footer="footer" ></Footer> */}
      </main>
    </>
  )
}

export default Home