import { profile } from "../../assets/data/Data" 
import { Link } from 'react-router-dom'
import NewButton from "../homePageComponents/Button";
import { useState, useEffect } from "react";
import { useToast } from '../../hooks/useToast';
import { VITE_API_URL } from '../../../config';
import resolveUrl from '../../utils/url';
import Loader from '../../components/common/Loader'; 

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

function Profile({ channelId: propChannelId, channelData: initialChannelData, isOwner: initialIsOwner, isSubscribed: initialIsSubscribed }) {
    const { showSuccess, showError } = useToast();

    // --- ESTADOS INICIALIZADOS CON LAS PROPS ---
    const [channelName, setChannelName] = useState(initialChannelData?.channel_name || profile.name);
    const [channelHandle, setChannelHandle] = useState(initialChannelData?.url ? '@' + initialChannelData.url : profile.handle);
    const [channelDescription, setChannelDescription] = useState(initialChannelData?.description || profile.description);
    const [channelSubs, setChannelSubs] = useState(initialChannelData?.subscriberCount || 0);
    const [channelVideos, setChannelVideos] = useState(initialChannelData?.videoCount ? `${initialChannelData.videoCount} videos` : '0 videos');
    const [isOwner, setIsOwner] = useState(initialIsOwner);
    const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
    const [userPhoto, setUserPhoto] = useState(profile.src);
    const [isSubscribing, setIsSubscribing] = useState(false);

    const channelId = propChannelId;

    // --- EFECTO: SINCRONIZAR ESTADOS CON LAS PROPS DEL PADRE ---
    useEffect(() => {
        if (initialChannelData) {
            // Sincronizar datos del canal
            setChannelName(initialChannelData.channel_name || profile.name);
            setChannelHandle(initialChannelData.url ? '@' + initialChannelData.url : profile.handle);
            setChannelDescription(initialChannelData.description || profile.description);
            setChannelSubs(initialChannelData.subscriberCount || 0);
            setChannelVideos(initialChannelData.videoCount ? `${initialChannelData.videoCount} videos` : '0 videos');

            // Lógica para determinar la URL de la foto
            let photoSrc = profile.src;
            if (initialChannelData.photoUrl && initialChannelData.photoUrl.trim() !== '') {
                const photoPath = initialChannelData.photoUrl.trim();
                if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
                    photoSrc = photoPath;
                } else if (photoPath.startsWith('/uploads/')) {
                    photoSrc = resolveUrl(photoPath);
                } else if (photoPath.startsWith('/assets/images/profile/')) {
                    photoSrc = photoPath;
                } else if (photoPath.startsWith('/default-avatar/')) {
                    const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                    const letter = letterMatch ? letterMatch[1] : 'A';
                    photoSrc = `/assets/images/profile/${letter}.png`;
                } else {
                    photoSrc = resolveUrl(photoPath);
                }
            }
            setUserPhoto(photoSrc);
        }

        // Sincronizar estado de propiedad y suscripción
        setIsOwner(initialIsOwner);
        setIsSubscribed(initialIsSubscribed);

    }, [initialChannelData, initialIsOwner, initialIsSubscribed]);

    const handleSubscribe = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            showError('Please Log In to subscribe to channel');
            return;
        }

        setIsSubscribing(true);

        try {
            if (isSubscribed) {
                // Unsubscribe
                const result = await apiFetch('/subscriptions', {
                    method: 'DELETE',
                    body: JSON.stringify({ channelId: channelId }),
                });
                if (result) {
                    setIsSubscribed(false);
                    setChannelSubs(prev => prev - 1);
                    showSuccess(`Unsubscribed from ${channelName}`);
                }
            } else {
                // Subscribe
                const result = await apiFetch('/subscriptions', {
                    method: 'POST',
                    body: JSON.stringify({ channelId: channelId }),
                });
                if (result) {
                    setIsSubscribed(true);
                    setChannelSubs(prev => prev + 1);
                    showSuccess(`Subscribed to ${channelName}!`);
                }
            }
        } catch (error) {
            console.error("Subscription action failed:", error);
        } finally {
            setIsSubscribing(false);
        }
    };


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
                        <div className="container-subscribe-btn">
                            <NewButton
                                btnclass="subscribe-btn"
                                btntitle={isSubscribing ? <Loader isLocal={true} size="small" /> : isSubscribed ? "Catscribed" : "Catscribe"}
                                onClick={isSubscribing ? null : handleSubscribe}
                                disabled={isSubscribing}
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="row">
                {isOwner && (
                    <>
                        <Link to="/studio/?section=customization">
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