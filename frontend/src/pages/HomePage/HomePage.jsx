import './HomePage.css'
import '../../styles/Global_components.css'
import Ads from '../../components/homePageComponents/Ads.jsx'
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer.jsx";
import VideosContainer from '../../components/homePageComponents/VideosContainer.jsx'
import SectionsCarousel from '../../components/homePageComponents/SectionsCarousel.jsx'
import TopSectionWrapper from '../../components/homePageComponents/TopSectionWrapper.jsx'
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
        }));

        // Sort channels by subscriber count in descending order (Popular Channels)
        const sortedBySubscribers = [...transformedChannels].sort((a, b) => b.subs - a.subs);
        setChannels(sortedBySubscribers);

        // Sort channels by creation date (Recent Channels) - más reciente primero
        const sortedByDate = [...transformedChannels].sort((a, b) => {
          const dateA = new Date(a.channel_date);
          const dateB = new Date(b.channel_date);
          const diff = dateB - dateA;
          return diff;
        });

        console.log('✅ Canales ordenados por fecha:', sortedByDate.map(c => ({ name: c.name, channel_date: c.channel_date })));
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
          channel_date: short.channel_date,
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
        <SectionsCarousel section="popular-channels" subtitle="Recent Channels" ref={popularChannelsRef} render={recentChannels} type="profile" cts="carousel-cts" ></SectionsCarousel>

        <SectionsCarousel section="trending" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></SectionsCarousel>
        {/* <Sections section="subscriptions" subtitle="Catscribers" ref={catsRef} render={videos} type="video" cts="carousel-ctsvideos"></Sections> */}

        <TopSectionWrapper channels={channels} videos={videos} />

        <VideosContainer />

        {/* <Ads /> */}

        <Footer footer="footer" ></Footer>
      </main>
    </>
  )
}

export default Home