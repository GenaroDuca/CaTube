import './TopSectionWrapper.css';
import TopChannelsPodium from './TopChannelsPodium';
import MostViewedVideo from './MostViewedVideo';

function TopSectionWrapper({ channels, videos }) {
    // Obtener el video más visto
    const mostViewedVideo = videos && videos.length > 0
        ? [...videos].sort((a, b) => b.views - a.views)[0]
        : null;

    return (
        <div className="top-section-wrapper">
            {/* <MostViewedVideo video={mostViewedVideo} /> */}
            <TopChannelsPodium channels={channels} />
        </div>
    );
}

export default TopSectionWrapper;
