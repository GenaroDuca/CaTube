import { getAuthToken } from '../../utils/auth.js';
import React, { useState, useEffect } from 'react';


function RightMenu({ channelId }) {
    const BASE_URL = 'http://localhost:3000';
    const [channel, setChannel] = useState(null);
    const getAvatar = (channel) => {
        if (channel.photoUrl && channel.photoUrl.trim() !== '') {
            let photoPath = channel.photoUrl;
            if (photoPath.startsWith('/uploads/')) {
                // Imagen subida por el usuario
                return BASE_URL + photoPath;
            } else if (photoPath.startsWith('/assets/images/profile/')) {
                // Imagen predeterminada ya mapeada
                return photoPath;
            } else if (photoPath.startsWith('/default-avatar/')) {
                // Map old default-avatar paths to new assets path
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                return `/assets/images/profile/${letter}.png`;
            } else {
                // Otro tipo de ruta, asumir que es subida
                return BASE_URL + photoPath;
            }
        } else {
            // Set default avatar based on first letter of channel name
            const firstLetter = channel.channel_name?.charAt(0).toUpperCase() || 'A';
            return `/assets/images/profile/${firstLetter}.png`;
        }
    };

    useEffect(() => {        
        const fetchChannel = async () => {
            const accessToken = getAuthToken();;

            if (!channelId || !accessToken) {
                // console.warn('No channelId or accessToken found, skipping fetch');
                setChannel(null);
                return;
            }
            try {
                const response = await fetch(`${BASE_URL}/channels/${channelId}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setChannel(data);
                } else {
                    console.error('Error fetching channel:', response.status);
                }
            } catch (error) {
                console.error('Error fetching channel data:', error);
            }
        };
        fetchChannel();
    }, [channelId]);

    const photoSrc = channel ? getAvatar(channel) : '/assets/images/profile/A.png';
    const channelName = channel ? channel.channel_name : 'Channel Name';

    return (
        <div className="right-menu">
            <img src={photoSrc} alt={channelName} />
            <h1>{channelName}</h1>
        </div>
    );
}

export default RightMenu;