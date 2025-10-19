import React, { useState, useEffect } from 'react';
import angel from "../../assets/images/profile/angel.jpg";

function RightMenu() {
    const BASE_URL = 'http://localhost:3000';
    const [channel, setChannel] = useState(null);

    const getAvatar = (channel) => {
        if (channel.photoUrl) {
            let photoPath = channel.photoUrl;
            if (photoPath.startsWith('/default-avatar/')) {
                // Map old default-avatar paths to new assets path
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                photoPath = `/assets/images/profile/${letter}.png`;
            }
            return BASE_URL + photoPath;
        } else {
            return angel;
        }
    };

    useEffect(() => {
        const fetchChannel = async () => {
            const channelId = localStorage.getItem('channelId');
            const accessToken = localStorage.getItem('accessToken');
            if (!channelId || !accessToken) {
                console.warn('No channelId or accessToken found, skipping fetch');
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
    }, []);

    const photoSrc = channel ? getAvatar(channel) : angel;
    const channelName = channel ? channel.channel_name : 'Channel Name';

    return (
        <div className="right-menu">
            <img src={photoSrc} alt={channelName} />
            <h1>{channelName}</h1>
        </div>  
    );
}

export default RightMenu;
