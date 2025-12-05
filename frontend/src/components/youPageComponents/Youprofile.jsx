import { youProfile } from "../../assets/data/Data";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { VITE_API_URL } from '../../../config';
import Loader from '../../components/common/Loader';


// Función de fetch de API (se mantiene igual)
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

    // USR INFO
    const [username, setUsername] = useState('');
    const [userEmail, setUserEmail] = useState(''); // Nuevo: para mostrar más info de usuario
    const [userDescription, setUserDescription] = useState('');
    const [userPhoto, setUserPhoto] = useState('');

    //CHANNEL INFO
    const [channelName, setChannelName] = useState('');
    const [channelHandle, setChannelHandle] = useState('');
    const [channelDescription, setChannelDescription] = useState('');
    const [channelSubs, setChannelSubs] = useState('');
    const [loading, setLoading] = useState(true);
    const [channelPhoto, setChannelPhoto] = useState('');

    useEffect(() => {
        setLoading(true);
        async function loadChannelData() {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setLoading(false);
                return;
            }

            try {
                // 1. OBTENER DATOS DEL USUARIO
                const userData = await apiFetch('/users/me');

                if (userData) {
                    setUsername(userData.username);
                    setUserEmail(userData.email);
                    setUserDescription(userData.description);
                    setUserPhoto(userData.avatarUrl);
                }

                if (userData && userData.channel) {
                    const channelId = userData.channel.channel_id;

                    // 2. OBTENER DATOS DEL CANAL (A veces /users/me ya trae todo lo necesario, pero mantengo la llamada a /channels/id)
                    const channelData = await apiFetch('/channels/' + channelId);

                    // Si channelData es null, usamos los datos parciales de userData.channel
                    const finalChannelData = channelData || userData.channel;

                    if (finalChannelData) {
                        setChannelName(finalChannelData.channel_name);
                        setChannelHandle(finalChannelData.url ? '@' + finalChannelData.url : youProfile.handle);
                        setChannelDescription(finalChannelData.description);
                        setChannelSubs(finalChannelData.subscriberCount);
                        setChannelPhoto(finalChannelData.photoUrl);
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

    // ---
    // RENDERIZADO DE CARGA
    // ---
    if (loading) {
        return (
            <main className="main-content">
                <Loader isOverlay={true} />
            </main>
        );
    }

    if (!localStorage.getItem('accessToken')) {
        return null;
    }

    // ---
    // RENDERIZADO FINAL CON SEPARACIÓN DE INFO
    // ---
    return (
        <div className="container-profile">
            {/* SECCIÓN DE INFORMACIÓN DEL CANAL */}
            <div className="profile-info-you-page" onClick={handleClick} style={{ cursor: 'pointer' }}>
                <h2>Your Channel info</h2>
                <div className="first-part-profile">
                    <img className="channel-photo" src={channelPhoto} alt={channelName} />
                    <div className="text-channel">
                        <h3>{channelName} </h3>
                        <div className="row-info">
                            <p className="space">@{channelHandle.replace('@', '')} </p>
                            <p className="space">{channelSubs} Catscribers </p>
                            <p className="space">{youProfile.videos} Videos </p>
                        </div>
                        <p>{channelDescription} </p>
                    </div>
                </div>
            </div>

            <div className="profile-info-you-page">
                <h2>Your User info</h2>
                <div className="first-part-profile">
                    <img className="channel-photo" src={userPhoto} alt={username} />
                    <div className="text-channel">
                        <h3>{username} </h3>
                        <div className="row-info">
                            <p className="space">{userEmail}</p>
                        </div>
                        <p> {userDescription}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Youprofile;