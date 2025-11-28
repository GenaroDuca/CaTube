import { getAuthToken } from '../../utils/auth.js';
import React, { useState, useEffect } from 'react';
import { VITE_API_URL } from "../../../config"
import resolveUrl from '../../utils/url';
import { Link } from 'react-router-dom';


function RightMenu({ channelId }) {
    const [channel, setChannel] = useState(null);

    // Función para determinar la fuente de la imagen del avatar
    const getAvatar = (channel) => {
        if (channel.photoUrl && channel.photoUrl.trim() !== '') {
            let photoPath = channel.photoUrl;

            // Verificar si ya es una URL absoluta
            if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
                return photoPath;
            } else if (photoPath.startsWith('/assets/images/profile/')) {
                // Imagen predeterminada ya mapeada
                return photoPath;
            } else if (photoPath.startsWith('/default-avatar/')) {
                // Map old default-avatar paths to new assets path
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                return `/assets/images/profile/${letter}.png`;
            } else {
                // Asumir que es una ruta relativa de la API
                return resolveUrl(photoPath);
            }
        } else {
            // Set default avatar based on first letter of channel name
            const firstLetter = channel.channel_name?.charAt(0).toUpperCase() || 'A';
            return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
        }
    };

    // Hook useEffect para cargar los datos del canal
    useEffect(() => {
        const fetchChannel = async () => {
            const accessToken = getAuthToken();

            if (!channelId || !accessToken) {
                // console.warn('No channelId or accessToken found, skipping fetch');
                setChannel(null);
                return;
            }
            try {
                const response = await fetch(`${VITE_API_URL}/channels/${channelId}`, {
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

    // Variables derivadas del estado del canal
    const photoSrc = channel ? getAvatar(channel) : '/assets/images/profile/A.png';
    const channelName = channel ? channel.channel_name : 'Channel Name';
    // Se asegura de usar channel.url o una cadena vacía si channel es nulo
    const channelUrl = channel ? channel.url : ''; 

    return (
        // El componente Link utiliza channelUrl en su atributo 'to'
        <Link to={`/yourchannel/${channelUrl}`} className="right-menu"> 
            <img src={photoSrc} alt={channelName} />
            <h2>{channelName}</h2>
        </Link>
    );
}

export default RightMenu;