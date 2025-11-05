import {useState, useMemo, useEffect} from 'react'

//Components
import { ChannelList } from '../../components/user/ChannelList.jsx'
import { VideoList } from '../../components/videoPageComponents/VideoList.jsx'
import { ShortList } from '../../components/shortPageComponents/ShortList.jsx'
import Header from '../../components/common/header/Header.jsx'
import Catbot from '../../components/catbot/catbot.jsx'

//Styles
import './SearchPage.css';

//Assets
import Angel from '../../assets/images/profile/angel.jpg'
import Yukki from '../../assets/images/profile/yukki.jpg'
import Gena from '../../assets/images/profile/gena.jpg'
import Jere from '../../assets/images/profile/jere.jpg'
import thumbnail from '../../assets/images/thumbnails/pinterest_swap_challenge.jpg'
import shortThumbnail from '../../assets/images/thumbnails/shorts.jpg'
import shortCats from '../../assets/images/thumbnails/funnycats.jpg'

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
        const response = await fetch('http://localhost:3000/channels');
        if (response.ok) {
          const data = await response.json();
          const transformedChannels = data.map(channel => {
            let avatar = Angel; // default fallback
            if (channel.photoUrl) {
              if (channel.photoUrl.startsWith('/uploads/')) {
                // Uploaded image
                avatar = `http://localhost:3000${channel.photoUrl}`;
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
                avatar = `http://localhost:3000${channel.photoUrl}`;
              }
            } else {
              // No photoUrl, use first letter of channel name
              const firstLetter = channel.channel_name?.charAt(0).toUpperCase() || 'A';
              avatar = `/assets/images/profile/${firstLetter}.png`;
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
        const res = await fetch('http://localhost:3000/videos');
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();

        const mapped = data.map(v => {
          const thumbnail = v.thumbnail && v.thumbnail.startsWith('/') ? `http://localhost:3000${v.thumbnail}` : (v.thumbnail || '');
          const avatar = v.channel?.photoUrl
            ? (v.channel.photoUrl.startsWith('/uploads/') ? `http://localhost:3000${v.channel.photoUrl}` : v.channel.photoUrl)
            : '/assets/images/profile/A.png';
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


  return (
    <div className="search-page">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="main-content">
        <section className='catbot'>
          <Catbot />
        </section>
        <section className="channel-section">
          <ChannelList channels={filteredChannels} />
        </section>
        <section className="video-section">
          <VideoList videos={filteredVideos} />
        </section>
        <section className='short-section'>
          <ShortList shorts={filteredShorts} />
        </section>
      </main>
    </div>
  );
}

export default Search
