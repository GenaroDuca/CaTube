import React from 'react';
import VideoActivityCard from './VideoActivityCard';
import ShortActivityCard from './ShortActivityCard';

function LastActivity({ lastVideo, lastShort }) {
  return (
    <div className="recomendation-discover-last-activity-container">
      <h3>Last Activity</h3>
      <div className="recomendation-dicover-last-activity-video-conainer">
        {lastVideo && <VideoActivityCard {...lastVideo} />}
        {lastShort && <ShortActivityCard {...lastShort} />}
      </div>
    </div>
  );
}

export default LastActivity;
