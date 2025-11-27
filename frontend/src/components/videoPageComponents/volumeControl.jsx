import { useState } from 'react';
import { ImVolumeMedium } from "react-icons/im";
import { ImVolumeMute2 } from "react-icons/im";
import { ImVolumeHigh } from "react-icons/im";
import { ImVolumeLow } from "react-icons/im";

export function VolumeControl({ volume, isMuted, changeVolume }) {
    const [showSlider, setShowSlider] = useState(false);

    const getIcon = () => {
        if (isMuted || volume === 0) return <ImVolumeMute2 color=' rgb(144, 180, 132' size={25} />;
        if (volume === 1) return <ImVolumeHigh color=' rgb(144, 180, 132' size={25} />;
        if (volume < 0.5) return <ImVolumeLow color=' rgb(144, 180, 132' size={25} />;
        return <ImVolumeMedium color=' rgb(144, 180, 132' size={25} />;
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