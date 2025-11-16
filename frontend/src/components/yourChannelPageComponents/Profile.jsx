import { profile } from "../../assets/data/Data"
import { Link } from 'react-router-dom'
import NewButton from "../homePageComponents/Button";
import { useState, useEffect } from "react";
import { useNotification } from "../../hooks/UseNotification";
import { useToast } from '../../hooks/useToast';

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

function Profile() {
    const { showError } = useNotification();
    const { showSuccess } = useToast();
    const [userPhoto, setUserPhoto] = useState(profile.src);
    const [channelName, setChannelName] = useState(profile.name);
    const [channelHandle, setChannelHandle] = useState(profile.handle);
    const [channelDescription, setChannelDescription] = useState(profile.description);
    const [channelSubs, setChannelSubs] = useState(profile.subs);
    const [channelVideos, setChannelVideos] = useState(profile.videos);
    const [isOwner, setIsOwner] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [channelId, setChannelId] = useState(localStorage.getItem('channelId'));
    const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
    const [userId, setUserId] = useState(null);

    // Listen for changes in localStorage
    useEffect(() => {
        const handleStorageChange = () => {
            const newChannelId = localStorage.getItem('channelId');
            const newAccessToken = localStorage.getItem('accessToken');
            setChannelId(newChannelId);
            setAccessToken(newAccessToken);
            setUserId(null); // Reset userId to force re-fetch
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check for changes within the same tab
        const interval = setInterval(() => {
            const currentChannelId = localStorage.getItem('channelId');
            const currentAccessToken = localStorage.getItem('accessToken');
            if (currentChannelId !== channelId || currentAccessToken !== accessToken) {
                setChannelId(currentChannelId);
                setAccessToken(currentAccessToken);
                setUserId(null); // Reset userId to force re-fetch
            }
        }, 1000); // Check every second

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [channelId, accessToken]);

    const handleSubscribe = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            showError('Please Log In to subscribe to channel');
            return;
        }

        const channelId = localStorage.getItem('channelId');
        if (isSubscribed) {
            // Unsubscribe
            const result = await apiFetch('/subscriptions', {
                method: 'DELETE',
                body: JSON.stringify({ channelId }),
            });
            if (result) {
                setIsSubscribed(false);
                setChannelSubs(prev => prev - 1);
                showSuccess(`Unsubscribed from ${channelName}`);
            }
        } else {
            // Subscribe
            try {
                const result = await apiFetch('/subscriptions', {
                    method: 'POST',
                    body: JSON.stringify({ channelId }),
                });
                if (result) {
                    setIsSubscribed(true);
                    setChannelSubs(prev => prev + 1);
                    showSuccess(`Subscribed to ${channelName}!`);
                }
            } catch (error) {
                // If already subscribed, just update the state
                if (error.message && error.message.includes('already subscribed')) {
                    setIsSubscribed(true);
                    setChannelSubs(prev => prev + 1);
                    showSuccess(`Subscribed to ${channelName}!`);
                }
            }
        }
    };

    useEffect(() => {
        async function loadChannelData() {
            const currentChannelId = localStorage.getItem('channelId');
            const currentAccessToken = localStorage.getItem('accessToken');

            if (!currentChannelId) return;

            // Reset states at the beginning to avoid stale data
            setIsOwner(false);
            setIsSubscribed(false);

            // Load channel data
            const channelData = await apiFetch('/channels/' + currentChannelId);
            if (channelData) {
                setChannelName(channelData.channel_name || profile.name);
                setChannelHandle(channelData.url ? '@' + channelData.url : profile.handle);
                setChannelDescription(channelData.description || profile.description);
                setChannelSubs(channelData.subscriberCount || 0);
                setChannelVideos(channelData.videoCount ? `${channelData.videoCount} videos` : '0 videos');
                let photoSrc;
                if (channelData.photoUrl && channelData.photoUrl.trim() !== '') {
                    let photoPath = channelData.photoUrl;
                    if (photoPath.startsWith('/uploads/')) {
                        // Imagen subida por el usuario
                        photoSrc = BASE_URL + photoPath;
                    } else if (photoPath.startsWith('/assets/images/profile/')) {
                        // Imagen predeterminada ya mapeada
                        photoSrc = photoPath;
                    } else if (photoPath.startsWith('/default-avatar/')) {
                        // Map old default-avatar paths to new assets path
                        const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                        const letter = letterMatch ? letterMatch[1] : 'A';
                        photoSrc = `/assets/images/profile/${letter}.png`;
                    } else {
                        // Otro tipo of ruta, asumir que es subida
                        photoSrc = BASE_URL + photoPath;
                    }
                } else {
                    // Set default avatar based on first letter of channel name
                    const firstLetter = channelData.channel_name?.charAt(0).toUpperCase() || 'A';
                    photoSrc = `/assets/images/profile/${firstLetter}.png`;
                }
                setUserPhoto(photoSrc);
            }

            // Check if user is the owner and subscription status
            if (currentAccessToken) {
                const userData = await apiFetch('/users/me');
                if (userData) {
                    setUserId(userData.user_id); // Store userId for dependency
                    if (userData.channel && userData.channel.channel_id === currentChannelId) {
                        setIsOwner(true);
                        setIsSubscribed(false); // Owner can't subscribe to their own channel
                    } else {
                        setIsOwner(false);
                        // Check if user is subscribed to this channel
                        const subscriptions = await apiFetch('/subscriptions/user/' + userData.user_id);
                        setIsSubscribed(subscriptions ? subscriptions.some(sub => sub.channel_id === currentChannelId) : false);
                    }
                }
            } else {
                setIsOwner(false);
                setIsSubscribed(false);
                setUserId(null);
            }
        }
        loadChannelData();
    }, [channelId, accessToken, userId]); // Add userId to dependencies to force re-run when user changes

    return (
    <div className="container-profile">
        <div className="first-part-profile">
            <img className="channel-photo" src={userPhoto} alt={channelName} />
            <div className="text-channel">
                <h2>{channelName} </h2>
                <div className="row-info">
                    <p className="space">{channelHandle} </p>
                    <p className="space">{channelSubs} Catscribers </p>
                    <p className="space">{channelVideos} </p>
                </div>
                <p>{channelDescription} </p>
                {!isOwner && (
                    <NewButton btnclass="subscribe-btn" btntitle={isSubscribed ? "Subscribed" : "Subscribe"} onClick={handleSubscribe}></NewButton>
                )}
            </div>
        </div>
        <div className="row">
            {isOwner && (
                <>
                    <Link to="/studio/?section=customization" className="customize-btn-channel">
                    <NewButton btnclass="customize-btn-channel" btntitle="Customize channel"></NewButton>
                    </Link>
                    <Link to="/studio/?section=content">
                    <NewButton btnclass="manage-btn-videos" btntitle="Manage videos"></NewButton>
                    </Link>
                </>
            )}
        </div>
    </div>
    );
}

export default Profile;