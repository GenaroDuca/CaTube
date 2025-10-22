import { useState } from 'react';
import { FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import './volumeControl.css';

export function VolumeControl({ volume, isMuted, changeVolume }) {
    const [showSlider, setShowSlider] = useState(false);

    const getIcon = () => {
        if (isMuted || volume === 0) return <FaVolumeMute />;
        if (volume < 0.5) return <FaVolumeDown />;
        return <FaVolumeUp />;
    };

    return (
        <div className="volume-control">
        <button onClick={() => setShowSlider((prev) => !prev)}>
            {getIcon()}
        </button>
        {showSlider && (
            <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            />
        )}
        </div>
    );
}
