import Title from "../../trendingPageComponents/Title";
import Container from "../../common/Container";
import CardCustomization from "./CardCustomization";
import InfoContainer from "./InfoContainer";

import banner from "../../../assets/images/studio_media/banner-customization.png"
import { useState, useEffect } from "react";
import { useToast } from "../../../hooks/useToast";
import { VITE_API_URL } from "../../../../config"


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


function Customization({ channelId }) {
    const { showSuccess, showError } = useToast();
    const [photoPreview, setPhotoPreview] = useState("");
    const [bannerPreview, setBannerPreview] = useState("");
    const [channelData, setChannelData] = useState(null);

    const getAvatar = (channel) => {
        if (channel.photoUrl && channel.photoUrl.trim() !== '') {
            let photoPath = channel.photoUrl;

            if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
                return photoPath;
            } else if (photoPath.startsWith('/assets/images/profile/')) {
                return photoPath;
            } else if (photoPath.startsWith('/default-avatar/')) {
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${letter}.png`;
            }
        } else {
            // Set default avatar based on first letter of channel name
            const firstLetter = channel.channel_name?.charAt(0).toUpperCase() || 'A';
            return `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
        }
    };

    const getBanner = (channel) => {
        if (channel.bannerUrl) {
            let bannerPath = channel.bannerUrl;
            return bannerPath;
        } else {
            return banner;
        }
    };

    useEffect(() => {
        async function loadChannelData() {
            if (!channelId) {
                setPhotoPreview('/assets/images/profile/A.png');
                setBannerPreview(banner);
                return;
            }
            try {
                const channelData = await apiFetch('/channels/' + channelId);
                if (channelData) {
                    setPhotoPreview(getAvatar(channelData));
                    setBannerPreview(getBanner(channelData));
                    setChannelData(channelData);
                }
            } catch (error) {
                console.error('Error displaying channel data:', error);
            }
        }
        loadChannelData();
    }, [channelId]);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));

            if (!channelId) {
                alert('Error: No se pudo identificar el canal. Por favor, inicia sesión de nuevo.');
                return;
            }

            const formData = new FormData();
            formData.append('photo', file);
            const photoResult = await apiFetch(`/channels/${channelId}/photo`, {
                method: 'POST',
                body: formData,
            });
            if (photoResult && photoResult.photoUrl) {
                setPhotoPreview(photoResult.photoUrl);
                showSuccess('Logo updated!');
            }
        }
    };

    const handleBannerChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerPreview(URL.createObjectURL(file));

            if (!channelId) {
                alert('Error: No se pudo identificar el canal. Por favor, inicia sesión de nuevo.');
                return;
            }

            const formData = new FormData();
            formData.append('banner', file);
            const bannerResult = await apiFetch(`/channels/${channelId}/banner`, {
                method: 'POST',
                body: formData,
            });
            if (bannerResult && bannerResult.bannerUrl) {
                setBannerPreview(bannerResult.bannerUrl);
                showSuccess('Banner updated');
            }
        }
    };

    return (
        <>
            <Title title="Customization"></Title>
            <Container className="content">
                <Container className="cards-customization-container">
                    <CardCustomization title="Banner image" imageClass="photo-card-banner" src={bannerPreview || banner} alt="Banner" for="banner-upload" onChange={handleBannerChange}></CardCustomization>
                    <CardCustomization title="Picture" imageClass="photo-card" src={photoPreview || '/assets/images/profile/A.png'} alt={channelData?.channel_name} for="picture-upload" onChange={handlePhotoChange}></CardCustomization>
                </Container >
                <InfoContainer channelId={channelId}></InfoContainer>
            </Container >
        </>
    );
}

export default Customization;
