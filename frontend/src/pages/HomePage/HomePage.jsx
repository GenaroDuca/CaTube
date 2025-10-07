import './HomePage.css'
import '../../styles/Global_components.css'
import Ads from '../../components/homePageComponents/Ads.jsx'
import Sidebar from "../../hooks/Sidebar";
import Footer from "../../hooks/Footer.jsx";
import Recommendations from '../../components/homePageComponents/Recommendations.jsx'
import Sections from '../../components/homePageComponents/Sections.jsx'
import Header from '../../components/common/header/Header.jsx'
import { popularChannels, shorts, videos } from '../../assets/data/Data.jsx';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';

function Home() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const popularChannelsRef = useRef(null);
  const catsRef = useRef(null);
  const shortsRef = useRef(null);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await axios.get('http://localhost:3000/channels');
        // Transform channels to match Profile component props
        const transformedChannels = response.data.map(channel => ({
          name: channel.channel_name,
          subs: channel.subscriberCount,
          photo: channel.photoUrl || '', // Use photoUrl if available
        }));
        setChannels(transformedChannels);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
        <Header></Header>
        <Sidebar />
        <main className="main-content">
          <Ads />
          <Sections section="popular-channels" subtitle="Popular Channels" ref={popularChannelsRef} render={channels} type="profile" cts="carousel-cts" ></Sections>
          <Sections section="trending" subtitle="Shorts" ref={shortsRef} render={shorts} type="short" cts="carousel-ctshorts"></Sections>
          <Sections section="subscriptions" subtitle="Catscribers" ref={catsRef} render={videos} type="video" cts="carousel-ctsvideos"></Sections>

          <Recommendations />

          <Ads />

          <Footer footer="footer"></Footer>
        </main>
    </>
  )
}

export default Home
