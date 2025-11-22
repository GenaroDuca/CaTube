import banner from '../../assets/images/studio_media/catube-pc.png';
import { useState, useEffect } from 'react';
import { VITE_API_URL } from '../../../config';

function Banner({ channelId }) {
    const [bannerSrc, setBannerSrc] = useState(banner);

    useEffect(() => {
        async function loadBanner() {
            if (!channelId) {
                setBannerSrc(banner);
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
            }
        }
        loadBanner();
    }, [channelId]);

    return (
        <div className="banner-container">
            <img className="banner-image" src={bannerSrc} alt="banner" />
        </div>
    );
}

export default Banner;
