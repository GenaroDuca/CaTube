import React from 'react';
import ChannelInfo from './ChannelInfo';
import LastActivity from './LastActivity';

function RecommendationCard({ data }) {
  const { channelName, bannerImg, lastVideo, lastShort } = data;

  return (
    <div className="recomendation-discover-container">
      <h2>Recomendation: + {channelName.toUpperCase()}</h2>
      <div className="recomendation-discover-card">
        <ChannelInfo {...data} /> {/* Pasa todos los datos del canal a ChannelInfo */}
        <div className="recomendation-dicover-banner-container">
          <img src={bannerImg} alt="Channel Banner" />
          <h5>Channel Banner</h5>
        </div>
        <LastActivity lastVideo={lastVideo} lastShort={lastShort} />
      </div>
    </div>
  );
}

export default RecommendationCard;