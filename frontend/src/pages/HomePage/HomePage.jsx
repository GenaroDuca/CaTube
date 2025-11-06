import './HomePage.css'
import '../../styles/Global_components.css'
import Ads from '../../components/homePageComponents/Ads.jsx'
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer.jsx";
import Recommendations from '../../components/homePageComponents/Recommendations.jsx'
import Sections from '../../components/homePageComponents/Sections.jsx'
import Header from '../../components/common/header/Header.jsx'
import { shorts } from '../../assets/data/Data.jsx';
import { useRef, useState, useEffect } from 'react';

function Home() {
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const popularChannelsRef = useRef(null);
  const catsRef = useRef(null);
  const shortsRef = useRef(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch('http://localhost:3000/channels');
        if (!response.ok) {
          throw new Error('Failed to fetch channels');
        }
        const data = await response.json();
        // Transform channels to match Profile component props
        const transformedChannels = data.map(channel => ({
          name: channel.channel_name,
          subs: channel.subscriberCount,
          photo: channel.photoUrl || '',
          url: channel.url,
          handle: '@' + channel.url,
        }));
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
        const response = await fetch('http://localhost:3000/videos');
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        // Transform videos to match Video component props
        const transformedVideos = data.map(video => ({
          id: video.id,
          namevideo: video.title,
          videoviews: `${video.views || 0} views`,
          thumbnail: video.thumbnail,
          channel_name: video.channel?.channel_name || 'Unknown'
        }));
        setVideos(transformedVideos);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setVideos([]); // Si hay error, usar array vacío para no romper la UI
      }
    };

    fetchChannels();
    fetchVideos();

    // Refresh data every 5 seconds
    const channelsInterval = setInterval(fetchChannels, 5000);
    const videosInterval = setInterval(fetchVideos, 5000);

    return () => {
      clearInterval(channelsInterval);
      clearInterval(videosInterval);
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
          <Sections section="popular-channels" subtitle="Popular Channels" ref={popularChannelsRef} render={channels} type="profile" cts="carousel-cts" ></Sections>
          <Sections section="trending" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></Sections>
          <Sections section="subscriptions" subtitle="Catscribers" ref={catsRef} render={videos} type="video" cts="carousel-ctsvideos"></Sections>

          <Recommendations />

          {/* <Ads /> */}

          <Footer footer="footer"></Footer>
        </main>
    </>
  )
}

export default Home