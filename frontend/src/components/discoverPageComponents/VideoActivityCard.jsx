import React from 'react';

function VideoActivityCard({ thumbnail, title, timeAgo, views, description }) {
  return (
    <a href="/watch_videos/watch_videos.html" className="recomendation-discover-last-activity-video">
      <img src={thumbnail} alt="Last Activity Profile Picture" />
      <div>
        <div className="recomendation-discover-last-activity-video-info">
          <h4>{title}</h4>
          <div>
            <p>{timeAgo}</p>
            <p>{views}</p>
          </div>
        </div>
        <p className="discover-video-description">{description}</p>
      </div>
    </a>
  );
}

export default VideoActivityCard;
