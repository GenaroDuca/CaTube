import React from 'react';

function ShortActivityCard({ thumbnail }) {
  return (
    <a href="/shorts/shorts.html" className="recomendation-discover-last-activity-short">
      <img src={thumbnail} alt="Last Short" />
    </a>
  );
}

export default ShortActivityCard;
