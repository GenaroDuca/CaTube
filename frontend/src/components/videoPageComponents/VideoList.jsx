//Hooks
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

//Components
import { CatubeVideoCard } from './CatubeVideoCard.jsx'

//Styles
import { getAuthToken } from '../../utils/auth.js'
import { VITE_API_URL } from '../../../config';


export function VideoList({ currentVideoId, videos: initialVideos }) {
    const [videos, setVideos] = useState([]);
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes('/watch')
    const token = getAuthToken();

    useEffect(() => {
        if (initialVideos && initialVideos.length > 0) {
            setVideos(initialVideos.filter(video => video.id !== currentVideoId));
            return;
        }

        const fetchVideos = async () => {
            try {
                const response = await fetch(`${VITE_API_URL}/videos`, {
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
    }, [currentVideoId, initialVideos]);

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