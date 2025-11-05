import Subtitle from "../../homePageComponents/Subtitle";
import Container from "../../common/Container";
import { useState, useEffect } from "react";


const BASE_URL = 'http://localhost:3000';

// Helper function to get profile image source
function getProfileImageSrc(photoUrl, username) {
    if (photoUrl && photoUrl.trim() !== '') {
        let photoPath = photoUrl;
        if (photoPath.startsWith('/uploads/')) {
            // Imagen subida por el usuario
            return BASE_URL + photoPath;
        } else if (photoPath.startsWith('/assets/images/profile/')) {
            // Imagen predeterminada ya mapeada
            return photoPath;
        } else if (photoPath.startsWith('/default-avatar/')) {
            // Map old default-avatar paths to new assets path
            const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : 'A';
            return `/assets/images/profile/${letter}.png`;
        } else {
            // Otro tipo de ruta, asumir que es subida
            return BASE_URL + photoPath;
        }
    } else {
        // Set default avatar based on first letter of username
        return getDefaultAvatar(username);
    }
}

// Helper function to get default avatar based on username
function getDefaultAvatar(username) {
    const firstLetter = username?.charAt(0).toUpperCase() || 'A';
    return `/assets/images/profile/${firstLetter}.png`;
}

function RecentCatscribers() {
    const [recentSubscribers, setRecentSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalSubs, setTotalSubs] = useState("Loading...");


    useEffect(() => {
        const fetchData = async () => {
            const channelId = localStorage.getItem('channelId');
            if (!channelId) {
                setLoading(false);
                return;
            }


            try {
                const accessToken = localStorage.getItem('accessToken');


                // Fetch recent subscribers
                const subscribersResponse = await fetch(`http://localhost:3000/subscriptions/me/recent`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });


                if (subscribersResponse.ok) {
                    const subscribersData = await subscribersResponse.json();
                    setRecentSubscribers(subscribersData);
                } else {
                    setError('Failed to fetch recent subscribers');
                }


                // Fetch total subscribers count from logged-in user's channel
                const userResponse = await fetch(`http://localhost:3000/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });


                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const userChannelId = userData.channel?.channel_id;
                    if (userChannelId) {
                        const channelResponse = await fetch(`http://localhost:3000/channels/${userChannelId}`, {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                            },
                        });


                        if (channelResponse.ok) {
                            const channelData = await channelResponse.json();
                            setTotalSubs(channelData.subscriberCount?.toLocaleString() || "0");
                        }
                    }
                }
            } catch (err) {
                setError('Error fetching data');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, []);


    if (loading) {
        return (
            <Container className="dashboard-card">
                <Subtitle subtitle="Recent Catscribers"></Subtitle>
                <Container className="recent-cats-container">
                    <p>Loading...</p>
                </Container>
            <Subtitle subtitle="Currents Catscribers"></Subtitle>
            <p className="sub-number">{totalSubs}</p>
            </Container>
        );
    }


    if (error) {
        return (
            <Container className="dashboard-card">
                <Subtitle subtitle="Recent Catscribers"></Subtitle>
                <Container className="recent-cats-container">
                    <p>{error}</p>
                </Container>
            <Subtitle subtitle="Currents Catscribers"></Subtitle>
            <p className="sub-number">{totalSubs}</p>
            </Container>
        );
    }


    return (
        <Container className="dashboard-card">
            <Subtitle subtitle="Recent Catscribers"></Subtitle>
            <Container className="recent-cats-container">
                {recentSubscribers.length > 0 ? (
                    recentSubscribers.map(subscriber => (
                        <Container key={subscriber.id} className="recent-cats">
                            <img
                                className="userphoto-recent-cats"
                                src={getProfileImageSrc(subscriber.channel?.photoUrl, subscriber.username)}
                                alt={subscriber.username}
                                onError={(e) => {
                                    e.target.src = getDefaultAvatar(subscriber.username);
                                }}
                            />
                            <Container>
                                <p>{subscriber.channel?.channel_name || subscriber.username}</p>
                                <p>{subscriber.channel?.subscriberCount ? `${subscriber.channel.subscriberCount} Catscribers` : '0 Catscribers'}</p>
                            </Container>
                        </Container>
                    ))
                ) : (
                    <p>No recent subscribers</p>
                )}
            </Container>
            <Subtitle subtitle="Currents Catscribers"></Subtitle>
            <p className="sub-number">{totalSubs}</p>
        </Container>
    );
}

export default RecentCatscribers;
