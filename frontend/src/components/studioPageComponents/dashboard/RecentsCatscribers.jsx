import Subtitle from "../../homePageComponents/Subtitle";
import Container from "../../common/Container";
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { VITE_API_URL } from '../../../../config';

// Helper function to get profile image source
function getProfileImageSrc(photoUrl, username) {
    if (photoUrl && photoUrl.trim() !== '') {
        let photoPath = photoUrl;
        if (photoPath.startsWith('/uploads/')) {
            // Imagen subida por el usuario
            return VITE_API_URL + photoPath;
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
            return photoPath;
        }
    } else {
        // Set default avatar based on first letter of username
        return getDefaultAvatar(username);
    }
}

// Helper function to get default avatar based on username
function getDefaultAvatar(username) {
    const firstLetter = username?.charAt(0).toUpperCase() || 'A';
    return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
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
                const subscribersResponse = await fetch(`${VITE_API_URL}/subscriptions/me/recent`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });


                if (subscribersResponse.ok) {
                    const subscribersData = await subscribersResponse.json();
                    setRecentSubscribers(subscribersData);

                    // Pre-fetch channel URLs for subscribers that include channel_id
                    try {
                        const channelIds = Array.from(new Set(subscribersData
                            .map(s => s.channel && s.channel.channel_id)
                            .filter(Boolean)));

                        if (channelIds.length > 0) {
                            const channelPromises = channelIds.map(id => fetch(`${VITE_API_URL}/channels/${id}`));
                            const channelResponses = await Promise.all(channelPromises);
                            const channelJsons = await Promise.all(channelResponses.map(r => r.ok ? r.json() : null));
                            const map = {};
                            channelJsons.forEach(ch => {
                                if (ch && ch.channel_id) map[ch.channel_id] = ch.url; // store slug
                            });
                            // Store in local state for rendering
                            // merge into recentSubscribers map by mapping ids to urls
                            setRecentSubscribers(prev => prev.map(s => ({ ...s, channelUrl: s.channel?.channel_id ? map[s.channel.channel_id] : undefined })));
                        }
                    } catch (err) {
                        console.error('Error prefetching subscriber channels:', err);
                    }
                } else {
                    setError('Failed to fetch recent subscribers');
                }


                // Fetch total subscribers count from logged-in user's channel
                const userResponse = await fetch(`${VITE_API_URL}/users/me`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });


                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    const userChannelId = userData.channel?.channel_id;
                    if (userChannelId) {
                        const channelResponse = await fetch(`${VITE_API_URL}/channels/${userChannelId}`, {
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
                    {[...Array(3)].map((_, index) => (
                        <Container key={index} className="recent-cats">
                            <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#e0e0e0' }}></div>
                            <Container>
                                <div className="skeleton" style={{ width: '120px', height: '16px', backgroundColor: '#e0e0e0', borderRadius: '4px', marginBottom: '5px' }}></div>
                                <div className="skeleton" style={{ width: '90px', height: '14px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}></div>
                            </Container>
                        </Container>
                    ))}
                </Container>
                <Subtitle subtitle="Currents Catscribers"></Subtitle>
                <div className="skeleton" style={{ width: '80px', height: '32px', backgroundColor: '#e0e0e0', borderRadius: '4px', margin: '0 auto' }}></div>
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
            {/* Aplica la clase 'empty' si no hay suscriptores */}
            <Container className={`recent-cats-container ${recentSubscribers.length === 0 ? 'empty' : ''}`}>
                {recentSubscribers.length > 0 ? (
                    recentSubscribers.map(subscriber => {
                        const channelSlug = subscriber.channelUrl || subscriber.channel?.url || null;
                        const to = channelSlug ? `/yourchannel/${channelSlug}` : '#';
                        return (
                            <Link key={subscriber.id} to={to} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <Container className="recent-cats">
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
                            </Link>
                        );
                    })
                ) : (
                    <p>No recent subscribers</p>
                )}
            </Container>
            <Subtitle subtitle="Currents Catscribers"></Subtitle>
            <p className="sub-number" style={{ color: 'var(--btn)' }}>{totalSubs}</p>
        </Container>
    );
}

export default RecentCatscribers;
