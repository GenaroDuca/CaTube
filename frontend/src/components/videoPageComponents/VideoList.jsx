//Hooks
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

//Components
import { CatubeVideoCard } from './CatubeVideoCard.jsx'

//Styles
import './VideoList.css'

import { getAuthToken } from '../../utils/auth.js'
import { API_URL } from '../../../config';


export function VideoList({ currentVideoId }) {
    const [videos, setVideos] = useState([]);
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes('/watch')
    const token = getAuthToken();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await fetch(`${API_URL}/videos`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const filteredVideos = data.filter(video => video.id !== currentVideoId);
                    setVideos(filteredVideos);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            }
        };

        fetchVideos();
    }, [currentVideoId]);

    const cardClassName = isVideoPage
        ? 'sr-videosSection watch'
        : 'sr-videosSection';

    return (
        <div className={cardClassName}>
            {videos.map((video) => (
                <CatubeVideoCard
                    key={video.id}
                    video={video}
                />
            ))}
        </div>
    )
}