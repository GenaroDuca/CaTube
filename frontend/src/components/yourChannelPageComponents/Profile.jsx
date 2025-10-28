import { profile } from "../../assets/data/Data"
import { Link } from 'react-router-dom'
import NewButton from "../homePageComponents/Button";
import { useState, useEffect } from "react";

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
    const [userPhoto, setUserPhoto] = useState(profile.src);
    const [channelName, setChannelName] = useState(profile.name);
    const [channelHandle, setChannelHandle] = useState(profile.handle);
    const [channelDescription, setChannelDescription] = useState(profile.description);
    const [channelSubs, setChannelSubs] = useState(profile.subs);

    useEffect(() => {
        async function loadChannelData() {
            const channelId = localStorage.getItem('channelId');
            if (channelId) {
                const channelData = await apiFetch('/channels/' + channelId);
                if (channelData) {
                    setChannelName(channelData.channel_name || profile.name);
                    setChannelHandle(channelData.url ? '@' + channelData.url : profile.handle);
                    setChannelDescription(channelData.description || profile.description);
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
        }
        loadChannelData();
    }, []);

    return (
        <div className="container-profile">
            <div className="first-part-profile">
                <img className="channel-photo" src={userPhoto} alt={channelName} />
                <div className="text-channel">
                    <h2>{channelName} </h2>
                    <div className="row-info">
                        <p className="space">{channelHandle} </p>
                        <p className="space">{channelSubs} Catscribers </p>
                        <p className="space">{profile.videos} </p>
                    </div>
                    <p>{channelDescription} </p>
                </div>
            </div>
            <div className="row">
                <Link to="/studio/?section=customization" className="customize-btn-channel">
                    <NewButton btnclass="customize-btn-channel" btntitle="Customize channel"></NewButton>
                </Link>
                <Link to="/studio/?section=content">
                    <NewButton btnclass="manage-btn-videos" btntitle="Manage videos"></NewButton>
                </Link>
            </div>
        </div>
    );
}

export default Profile;
