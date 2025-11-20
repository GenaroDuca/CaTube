import banner from '../../assets/images/studio_media/catube-pc.png';
import { useState, useEffect } from 'react';

function Banner({ channelId }) {
    const [bannerSrc, setBannerSrc] = useState(banner);

    useEffect(() => {
        async function loadBanner() {
            if (!channelId) {
                setBannerSrc(banner);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/channels/${channelId}`);
                if (response.ok) {
                    const channelData = await response.json();
                    if (channelData.bannerUrl) {
                        setBannerSrc(`http://localhost:3000${channelData.bannerUrl}`);
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
