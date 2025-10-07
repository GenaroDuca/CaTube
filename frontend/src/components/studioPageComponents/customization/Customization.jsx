import Title from "../../TrendingPageComponents/Title";
import Container from "../../../hooks/Container";
import CardCustomization from "./CardCustomization";
import InfoContainer from "./InfoContainer";
import angel from "../../../assets/images/profile/angel.jpg"
import banner from "../../../assets/images/studio_media/banner-customization.png"
import { useState, useEffect } from "react";

const BASE_URL = 'http://localhost:3000';

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
        const response = await fetch(`${BASE_URL}${url}`, { ...options, headers });

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

function Customization() {
    const [photoPreview, setPhotoPreview] = useState("");

    const getAvatar = (channel) => {
        if (channel.photoUrl) {
            let photoPath = channel.photoUrl;
            if (photoPath.startsWith('/default-avatar/')) {
                // Map old default-avatar paths to new assets path
                const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
                const letter = letterMatch ? letterMatch[1] : 'A';
                photoPath = `/assets/media/profile/${letter}.png`;
            }
            return BASE_URL + photoPath;
        } else {
            return angel;
        }
    };

    useEffect(() => {
        async function loadChannelData() {
            const channelId = localStorage.getItem('channelId');
            const accessToken = localStorage.getItem('accessToken');
            if (!channelId || !accessToken) {
                console.warn('No channelId or accessToken found, skipping loadChannelData');
                setPhotoPreview(angel);
                return;
            }
            try {
                const channelData = await apiFetch('/channels/' + channelId, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (channelData) {
                    setPhotoPreview(getAvatar(channelData));
                }
            } catch (error) {
                console.error('Error displaying channel data:', error);
            }
        }
        loadChannelData();
    }, []);

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));

            const channelId = localStorage.getItem('channelId');
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
                setPhotoPreview(BASE_URL + photoResult.photoUrl);
            }
        }
    };

    return (
        <>
            <Title title="Customization"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="cards-customization-container">
                    <CardCustomization title="Banner image" imageClass="photo-card-banner" src={banner} alt="Banner" for="banner-upload"></CardCustomization>
                    <CardCustomization title="Picture" imageClass="photo-card" src={photoPreview || angel} alt="angel" for="picture-upload" onChange={handlePhotoChange}></CardCustomization>
                </Container >
                <InfoContainer></InfoContainer>
            </Container >
        </>
    );
}

export default Customization;
