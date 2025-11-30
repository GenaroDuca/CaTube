import { VITE_API_URL } from '../../../config';
import resolveUrl from '../../utils/url';
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom';


//Components
import { ChannelList } from '../../components/user/ChannelList.jsx'
import { VideoList } from '../../components/videoPageComponents/VideoList.jsx'
import { ShortList } from '../../components/shortPageComponents/ShortList.jsx'
import Header from '../../components/common/header/Header.jsx'
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/common/Footer.jsx";
import Loader from '../../components/common/Loader';
import Container from '../../components/common/Container.jsx'
import Video from '../../components/homePageComponents/Video.jsx'
import Short from "../../components/homePageComponents/Short";

//Styles
import './SearchPage.css';

//Assets
import Angel from '../../assets/images/profile/angel.jpg'


// --- Constantes de Ordenamiento ---
const ORDER_OPTIONS = {
  VIEWS: 'views',
  RECENT: 'recent',
  OLDER: 'older',
  LIKES: 'most_liked',
};


export function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  // State to control if the initial query (URL/sessionStorage) has been processed.
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);

  // Estado para el ordenamiento
  const [orderBy, setOrderBy] = useState(ORDER_OPTIONS.RECENT);
  // Estado para la animación del dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 1. Initialization from Voice Search (sessionStorage)
  useEffect(() => {
    const searchTerm = sessionStorage.getItem('voiceSearchTerm');
    if (searchTerm) {
      sessionStorage.removeItem('voiceSearchTerm');
      setSearchQuery(searchTerm);
    }
    // Mark the initial query setup as complete
    setIsInitialLoadComplete(true);
  }, []);

  // 2. Initialization/Update from URL Query (?q=...)
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qFromUrl = params.get('q');
    if (qFromUrl) {
      setSearchQuery(qFromUrl);
    }
  }, [location.search]);

  // Fetch channels/videos/tags from API
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [category, setCategory] = useState('all');

  // Feedback function for empty results
  const renderEmptyMessage = (entity) => (
    <p className='empty-search' style={{ fontSize: '1em', padding: '20px 0', textAlign: 'center' }}>
      We couldn't find any {entity} that match with{' '}
      <strong style={{ color: 'var(--btn)' }}>"{searchQuery}"</strong>.
    </p>
  );

  const fetchChannelsFromServer = useCallback(async (q) => {
    setLoadingChannels(true);
    try {
      const url = q && q.trim() !== '' ? `${VITE_API_URL}/channels?q=${encodeURIComponent(q)}` : `${VITE_API_URL}/channels`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch channels');
      const data = await response.json();
      const transformedChannels = data.map(channel => {
        let avatar = Angel; // default fallback
        if (channel.photoUrl) {
          if (channel.photoUrl.startsWith('/uploads/')) {
            // Uploaded image
            avatar = resolveUrl(channel.photoUrl);
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
          url: channel.url,
          subscriptions: channel.subscriberCount || 0
        };
      });
      setChannels(transformedChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  }, []);

  const fetchVideosFromServer = useCallback(async (q, order) => {
    setLoadingVideos(true);
    try {
      // En una app real, usarías la URL con el parámetro 'orderBy':
      // const url = q && q.trim() !== '' ? `${VITE_API_URL}/videos?q=${encodeURIComponent(q)}&orderBy=${order}` : `${VITE_API_URL}/videos?orderBy=${order}`;

      // Aquí, simularemos el fetch sin el parámetro 'orderBy' en la URL
      const url = q && q.trim() !== '' ? `${VITE_API_URL}/videos?q=${encodeURIComponent(q)}` : `${VITE_API_URL}/videos`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch videos');
      let data = await res.json();

      // --- Lógica de Ordenamiento en el Frontend (Simulación) ---
      data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        switch (order) {
          case ORDER_OPTIONS.VIEWS:
            return (b.views || 0) - (a.views || 0);
          case ORDER_OPTIONS.RECENT:
            return dateB - dateA;
          case ORDER_OPTIONS.OLDER:
            return dateA - dateB;
          case ORDER_OPTIONS.LIKES:
            return (b.likes || 0) - (a.likes || 0);
          default:
            return 0;
        }
      });
      // --------------------------------------------------------

      const mapped = data.map(v => {
        const thumbnail = v.thumbnail && v.thumbnail.startsWith('/') ? `${VITE_API_URL}${v.thumbnail}` : (v.thumbnail || '');
        let avatar = '/assets/images/profile/A.png'; // default
        if (v.channel?.photoUrl) {
          if (v.channel.photoUrl.startsWith('/uploads/')) {
            avatar = resolveUrl(v.channel.photoUrl);
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

        const channelName = v.channel?.channel_name || 'Unknown';
        return {
          id: v.id,
          thumbnail,
          videoSrc: v.url && v.url.startsWith('/') ? `${VITE_API_URL}${v.url}` : (v.url || ''),
          avatar,
          channelAvatar: avatar,
          title: v.title,
          userName: channelName,
          channelName: channelName,
          channelId: v.channel?.channel_id,
          channelUrl: v.channel?.url,
          ownerId: v.channel?.user?.user_id,
          likes: v.likes || 0,
          comments: v.comments || 0,
          description: v.description || '',
          type: v.type || 'video',
          createdAt: v.createdAt,
          views: v.views || 0,
          viewsLabel: `${v.views || 0} views`
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
  }, []);

  const fetchTagsFromServer = useCallback(async (q) => {
    setLoadingTags(true);
    try {
      const url = q && q.trim() !== '' ? `${VITE_API_URL}/tags?q=${encodeURIComponent(q)}` : `${VITE_API_URL}/tags`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch tags');
      const data = await res.json();
      setTags(data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setTags([]);
    } finally {
      setLoadingTags(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const q = searchQuery;
    const handler = setTimeout(() => {
      // Only search if initial load is complete
      if (isInitialLoadComplete) {
        fetchChannelsFromServer(q);
        fetchVideosFromServer(q, orderBy); // Pasa orderBy
        fetchTagsFromServer(q);
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [searchQuery, isInitialLoadComplete, orderBy, fetchChannelsFromServer, fetchVideosFromServer, fetchTagsFromServer]); // Añadir 'orderBy'

  // Filters
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

  // Unified loading flag for data fetching
  const isLoading = loadingChannels || loadingVideos || loadingTags;

  // Flag for active search query
  const hasSearchQuery = searchQuery && searchQuery.trim() !== '';

  // Función para manejar el cambio de orden y cerrar el dropdown
  const handleOrderChange = (newOrder) => {
    setOrderBy(newOrder);
    setIsDropdownOpen(false);
  };

  // --- Componente Dropdown Animado ---
  const OrderByDropdown = () => (
    <div className="search-order-dropdown-container">
      {/* Botón que abre/cierra el Dropdown */}
      <button
        className={`dropdown-toggle-button ${isDropdownOpen ? 'open' : ''}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        Order by: {orderBy.charAt(0).toUpperCase() + orderBy.slice(1).replace('_', ' ')}
      </button>

      {/* Lista del Dropdown con animación via CSS */}
      <ul className={`dropdown-menu-search ${isDropdownOpen ? 'open' : ''}`}>
        <li onClick={() => handleOrderChange(ORDER_OPTIONS.RECENT)}
          className={orderBy === ORDER_OPTIONS.RECENT ? 'active' : ''}>Recent</li>

        <li onClick={() => handleOrderChange(ORDER_OPTIONS.VIEWS)}
          className={orderBy === ORDER_OPTIONS.VIEWS ? 'active' : ''}>Views</li>

        <li onClick={() => handleOrderChange(ORDER_OPTIONS.LIKES)}
          className={orderBy === ORDER_OPTIONS.LIKES ? 'active' : ''}>Most Liked</li>

        <li onClick={() => handleOrderChange(ORDER_OPTIONS.OLDER)}
          className={orderBy === ORDER_OPTIONS.OLDER ? 'active' : ''}>Older</li>
      </ul>

      {/* Overlay para cerrar el dropdown al hacer clic fuera */}
      {isDropdownOpen && (
        <div
          className="dropdown-overlay"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
  // ----------------------------------------

  // 0. Show Loader if initial URL/sessionStorage processing is not complete
  if (!isInitialLoadComplete) {
    return (
      <>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Sidebar />
        <main className="main-content">
          <Loader isOverlay={true} />
        </main>
      </>
    );
  }

  // 1. Show Loader if data is currently being fetched (after initialization)
  if (isLoading) {
    return (
      <>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Sidebar />
        <main className="main-content">
          <div style={{ margin: '20px' }}>
            <Loader />
          </div>
        </main>
      </>
    );
  }

  // 2. If no search query is active, show an initial guidance message
  if (!hasSearchQuery) {
    return (
      <>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <Sidebar />
        <main className="main-content">
          <div className="search-feedback-message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', marginTop: '20px', color: 'var(--text-color)' }}>
            <h2>Start a Search</h2>
            <p>Use the top bar to find videos, channels, or tags. Discover new content on Catube!</p>
          </div>
        </main>
      </>
    );
  }

  // 3. Main component rendering results
  return (
    <>
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Sidebar />
      <main className="main-content">
        <div className="search-categories-container">
          <div className="search-categories">
            {/* Botones de Categoría (Izquierda) */}
            <div className="category-buttons">
              <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>All ({filteredChannels.length + filteredVideos.length + filteredShorts.length + tags.length})</button>
              <button className={category === 'videos' ? 'active' : ''} onClick={() => setCategory('videos')}>Videos ({filteredVideos.length})</button>
              <button className={category === 'shorts' ? 'active' : ''} onClick={() => setCategory('shorts')}>Shorts ({filteredShorts.length})</button>
              <button className={category === 'channels' ? 'active' : ''} onClick={() => setCategory('channels')}>Channels ({filteredChannels.length})</button>
              <button className={category === 'tags' ? 'active' : ''} onClick={() => setCategory('tags')}>Tags ({tags.length})</button>
            </div>
            {/* Dropdown de Ordenamiento (Derecha) */}
            <div className="order-dropdown-wrapper">
              {(category === 'all' || category === 'videos' || category === 'shorts') && <OrderByDropdown />}
            </div>
          </div>
        </div>
        <div className='search-content-results'>
          {/* Channels Section */}
          {(category === 'all' || category === 'channels') && (
            <section className={filteredChannels.length > 0 ? "channel-section" : "channel-section empty-search"}>
              {filteredChannels.length > 0 ? (
                <ChannelList channels={filteredChannels} />
              ) : (
                renderEmptyMessage('channels')
              )}
            </section>
          )}

          {/* Videos Section */}
          {(category === 'all' || category === 'videos') && (
            <section className={filteredVideos.length > 0 ? "VideoContainer" : "VideoContainer empty-search"}>
              {filteredVideos.length > 0 ? (
                <Container className="recommendations-container">
                  {filteredVideos.map((video, index) => (
                    <Link to={`/watch/${video.id}`} key={video.id || index}>
                      <Video
                        namevideo={video.title}
                        videoviews={video.viewsLabel}
                        thumbnail={video.thumbnail}
                        createdAt={video.createdAt}
                      />
                    </Link>
                  ))}
                </Container>
              ) : (
                renderEmptyMessage('videos')
              )}
            </section>
          )}

          {/* Shorts Section */}
          {(category === 'all' || category === 'shorts') && (
            <Container className={filteredShorts.length > 0 ? "VideoContainer" : "VideoContainer empty-search"}>
              {filteredShorts.length > 0 ? (
                <Container className="recommendations-container shorts">
                  {filteredShorts.map((video, index) => (
                    <Link to={`/shorts/${video.id}`} key={video.id || index}>
                      <Short
                        key={index}
                        nameshort={video.title}
                        shortviews={video.viewsLabel}
                        thumbnail={video.thumbnail}
                        createdAt={video.createdAt}
                      />
                    </Link>
                  ))}
                </Container>
              ) : (
                renderEmptyMessage('Shorts')
              )}
            </Container>
          )}

          {/* Tags Section */}
          {(category === 'all' || category === 'tags') && (
            <section className={tags.length > 0 ? "channel-section" : "channel-section empty-search"}>

              <div className={tags.length > 0 ? "tags-list" : "tags-list empty-search"}>
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    className='tag-item'
                  >
                    <a href={`/discover?tag=${encodeURIComponent(tag.name)}`}>#{tag.name}</a>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span >We could not find any tags that match with <strong style={{ color: 'var(--btn)' }}>{searchQuery}</strong>.</span>
                )}
              </div>
            </section>
          )}
        </div>

      </main>
    </>
  );
}

export default Search