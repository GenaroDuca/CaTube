import banner from '../../assets/images/studio_media/catube-pc.png';
import { useState, useEffect } from 'react';
import { VITE_API_URL } from '../../../config';

function Banner({ channelId }) {
    const [bannerSrc, setBannerSrc] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBanner() {
            setLoading(true);
            if (!channelId) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${VITE_API_URL}/channels/${channelId}`);
                if (response.ok) {
                    const channelData = await response.json();
                    if (channelData.bannerUrl) {
                        setBannerSrc(`${channelData.bannerUrl}`);
                    } else {
                        setBannerSrc(banner);
                    }
                }
            } catch (error) {
                console.error('Error loading banner:', error);
                setBannerSrc(banner);
            } finally {
                setLoading(false);
            }
        }
        loadBanner();
    }, [channelId]);

    if (loading) {
        return (
            <div className="banner-container">
                <div className="banner-image skeleton" style={{ width: '100%', height: '200px', backgroundColor: '#e0e0e0' }}></div>
            </div>
        );
    }

    return (
        <div className="banner-container">
            <img className="banner-image" src={bannerSrc} alt="banner" />
        </div>
    );
}

export default Banner;
