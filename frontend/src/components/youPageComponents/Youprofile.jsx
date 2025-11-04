import { youProfile } from "../../assets/data/Data";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';

async function apiFetch(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

        if (response.status === 404) {
            return null;
        }

        const contentType = response.headers.get("content-type");
        let responseBody;
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseBody = await response.json();
        } else {
            responseBody = { message: await response.text() };
        }

        if (!response.ok) {
            const errorMessage = Array.isArray(responseBody.message) ? responseBody.message.join(', ') : JSON.stringify(responseBody.message);
            alert(`Error ${response.status}: ${errorMessage}`);
            console.error('Server response:', response.status, responseBody);
            return null;
        }
        return responseBody;
    } catch (error) {
        console.error('Connection error:', error);
        alert('Could not connect to the server.');
        return null;
    }
}

function Youprofile() {
    const navigate = useNavigate();
    const [userPhoto, setUserPhoto] = useState(youProfile.src);
    const [channelName, setChannelName] = useState(youProfile.name);
    const [channelHandle, setChannelHandle] = useState(youProfile.handle);
    const [channelDescription, setChannelDescription] = useState(youProfile.description);
    const [channelSubs, setChannelSubs] = useState(youProfile.subs);

    useEffect(() => {
        async function loadChannelData() {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                return;
            }

            try {
                const userData = await apiFetch('/users/me');
                if (userData && userData.channel) {
                    const channelId = userData.channel.channel_id;
                    const channelData = await apiFetch('/channels/' + channelId);
                    if (channelData) {
                        setChannelName(channelData.channel_name || youProfile.name);
                        setChannelHandle(channelData.url ? '@' + channelData.url : youProfile.handle);
                        setChannelDescription(channelData.description || youProfile.description);
                        setChannelSubs(channelData.subscriberCount || 0)
                        if (channelData.photoUrl) {
                            let photoPath = channelData.photoUrl;
                            if (photoPath.startsWith('/default-avatar/')) {
                                // Map old default-avatar paths to new assets path
                                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                                const letter = letterMatch ? letterMatch[1] : 'A';
                                photoPath = `/assets/images/profile/${letter}.png`;
                            }
                            setUserPhoto(BASE_URL + photoPath);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading user channel data:', error);
            }
        }
        loadChannelData();
    }, []);

    const handleClick = () => {
        if (channelHandle) {
            const url = channelHandle.replace('@', '');
            navigate(`/yourchannel/${url}`);
        }
    };

    return (
    <div className="container-profile" onClick={handleClick} style={{ cursor: 'pointer' }}>
        <div className="first-part-profile">
            <img className="channel-photo" src={userPhoto} alt={channelName} />
            <div className="text-channel">
                <h2>{channelName} </h2>
                <div className="row-info">
                    <p className="space">{channelHandle} </p>
                    <p className="space">{channelSubs} Catscribers </p>
                    <p className="space">{youProfile.videos} </p>
                </div>
                <p>{channelDescription} </p>
            </div>
        </div>
        </div>
    );
}

export default Youprofile;