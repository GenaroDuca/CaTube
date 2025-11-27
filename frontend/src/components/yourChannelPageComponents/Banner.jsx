import bannerDefault from '../../assets/images/studio_media/catube-pc.png';
import { useState, useEffect } from 'react';

function Banner({ channelData }) {
    const [bannerSrc, setBannerSrc] = useState(bannerDefault);

    useEffect(() => {
        if (channelData) {
            if (channelData.bannerUrl) {
                setBannerSrc(channelData.bannerUrl);
            } else {
                setBannerSrc(bannerDefault);
            }
        }
    }, [channelData]);

    if (!channelData) {
        // Renderiza un contenedor vacío o con la imagen por defecto
        return (
            <div className="banner-container">
                <img className="banner-image" src={bannerDefault} alt="banner" />
            </div>
        )
    }

    return (
        <div className="banner-container">
            <img className="banner-image" src={bannerSrc} alt="banner" />
        </div>
    );
}

export default Banner;