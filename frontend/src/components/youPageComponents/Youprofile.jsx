import { youProfile } from "../../assets/data/Data";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { VITE_API_URL } from '../../../config';


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
        const response = await fetch(`${VITE_API_URL}${url}`, { ...options, headers });

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadChannelData() {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setLoading(false);
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
                        let photoSrc;
                        if (channelData.photoUrl && channelData.photoUrl.trim() !== '') {
                            let photoPath = channelData.photoUrl;
                            if (photoPath.startsWith('/uploads/')) {
                                // Imagen subida por el usuario
                                photoSrc = VITE_API_URL + photoPath;
                            } else if (photoPath.startsWith('/assets/images/profile/')) {
                                // Imagen predeterminada ya mapeada
                                photoSrc = photoPath;
                            } else if (photoPath.startsWith('/default-avatar/')) {
                                // Map old default-avatar paths to new assets path
                                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                                const letter = letterMatch ? letterMatch[1] : 'A';
                                photoSrc = `/assets/images/profile/${letter}.png`;
                            } else {
                                // Otro tipo de ruta, asumir que es subida
                                photoSrc = photoPath;
                            }
                        } else {
                            // Set default avatar based on first letter of channel name
                            const firstLetter = channelData.channel_name?.charAt(0).toUpperCase() || 'A';
                            photoSrc = `/assets/images/profile/${firstLetter}.png`;
                        }
                        setUserPhoto(photoSrc);
                    }
                }
            } catch (error) {
                console.error('Error loading user channel data:', error);
            } finally {
                setLoading(false);
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

    if (loading) {
        return (
            <div className="container-profile">
                <div className="first-part-profile">
                    <div className="skeleton" style={{ width: '200px', height: '200px', borderRadius: '50%', backgroundColor: '#e0e0e0' }}></div>
                    <div className="text-channel" style={{ width: '100%' }}>
                        <div className="skeleton" style={{ width: '40%', height: '32px', marginBottom: '10px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                        <div className="row-info">
                            <div className="skeleton" style={{ width: '120px', height: '18px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginRight: '10px' }}></div>
                            <div className="skeleton" style={{ width: '100px', height: '18px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginRight: '10px' }}></div>
                            <div className="skeleton" style={{ width: '80px', height: '18px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                        </div>
                        <div className="skeleton" style={{ width: '60%', height: '16px', marginTop: '10px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        );
    }

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