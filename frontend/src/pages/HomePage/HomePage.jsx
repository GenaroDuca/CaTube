import './HomePage.css'
import '../../styles/Global_components.css'
import Ads from '../../components/homePageComponents/Ads.jsx'
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer.jsx";
import VideosContainer from '../../components/homePageComponents/VideosContainer.jsx'
import SectionsCarousel from '../../components/homePageComponents/SectionsCarousel.jsx'
import Header from '../../components/common/header/Header.jsx'
import { useRef, useState, useEffect } from 'react';
import { getAuthToken } from "../../utils/auth";
import { VITE_API_URL } from '../../../config';

function Home() {
  const [channels, setChannels] = useState([]);
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
          handle: '@' + channel.url,
        }));
        
        console.log("Fotos de todos los canales:", transformedChannels.map(c => c.photo));
        // Sort channels by subscriber count in descending order
        transformedChannels.sort((a, b) => b.subs - a.subs);
        setChannels(transformedChannels);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchVideos = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/videos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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
          namevideo: video.title,
          videoviews: `${video.views || 0} views`,
          thumbnail: `${video.thumbnail}`,
          channel_name: video.channel?.channel_name || 'Unknown'
        }));
        setVideos(transformedVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos([]); // Si hay error, usar array vacío para no romper la UI
      }
    };

    const fetchShorts = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/videos/shorts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
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

    // Refresh data every 5 seconds
    const channelsInterval = setInterval(fetchChannels, 5000);
    const videosInterval = setInterval(fetchVideos, 5000);
    const shortsInterval = setInterval(fetchShorts, 5000);

    return () => {
      clearInterval(channelsInterval);
      clearInterval(videosInterval);
      clearInterval(shortsInterval);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
        <SectionsCarousel section="popular-channels" subtitle="Recent Channels" ref={popularChannelsRef} render={channels} type="profile" cts="carousel-cts" ></SectionsCarousel>
        <SectionsCarousel section="trending" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></SectionsCarousel>
        {/* <Sections section="subscriptions" subtitle="Catscribers" ref={catsRef} render={videos} type="video" cts="carousel-ctsvideos"></Sections> */}

        <VideosContainer />

        {/* <Ads /> */}

        <Footer footer="footer" ></Footer>
      </main>
    </>
  )
}

export default Home