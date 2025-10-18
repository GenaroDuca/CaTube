import React from 'react';

function ChannelInfo({ profileImg, channelName, subs, videos, description }) {
  return (
    <a href="/yourChannel/yourChannel.html" className="recomendation-discover-channel-info">
      <img src={profileImg} alt="Channel Profile" />
      <h3>{channelName}</h3>
      <div>
        <p>{subs} subs</p>
        <p>{videos} videos</p>
      </div>
      <p className="discover-video-description">{description}</p>
    </a>
  );
}

export default ChannelInfo;