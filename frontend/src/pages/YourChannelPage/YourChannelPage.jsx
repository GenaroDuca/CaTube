import "../YourChannelPage/YourChannelPage.css";
import "../HomePage/HomePage.css";
import "../../styles/Global_components.css"
import Sidebar from "../../components/common/Sidebar";
import Banner from "../../components/yourChannelPageComponents/Banner.jsx";
import Profile from "../../components/yourChannelPageComponents/Profile";
import ContainerButton from "../../components/yourChannelPageComponents/ContainerButton";
import HomeTab from "../../components/yourChannelPageComponents/HomeTab";
import VideosTab from "../../components/yourChannelPageComponents/VideosTab";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Importado useNavigate
import ShortsTab from "../../components/yourChannelPageComponents/ShortsTab";
import PostsTab from "../../components/yourChannelPageComponents/PostsTab";
import Header from "../../components/common/header/Header.jsx";
import { VITE_API_URL } from '../../../config';
import StoreChannel from "../../components/yourChannelPageComponents/StoreChannel.jsx";
import Loader from "../../components/common/Loader";

function YourChannel() {
    const { url } = useParams();
    const navigate = useNavigate();

    const tabLabels = ['Home', 'Videos', 'Shorts', 'Posts', 'Store'];
    const [activeTab, setActiveTab] = useState(0);
    const [channelId, setChannelId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false); // Estado de suscripción global

    // --- ESTADOS CLAVE PARA CARGA CENTRALIZADA ---
    const [loading, setLoading] = useState(true);
    const [channelFound, setChannelFound] = useState(true);
    const [channelData, setChannelData] = useState(null);

    const tabContents = [
        <HomeTab key={`home-${channelId}`} channelId={channelId} />,
        <VideosTab key={`videos-${channelId}`} />,
        <ShortsTab key={`shorts-${channelId}`} />,
        <PostsTab key={`posts-${channelId}`} isOwner={isOwner} channelId={channelId} />,
        <StoreChannel key={`store-${channelId}`} isOwner={isOwner} channelId={channelId} />
    ];

    // --- EFECTO: Carga Centralizada del Canal y sus Datos ---
    useEffect(() => {
        setChannelId(null);
        setChannelData(null);
        setActiveTab(0);
        setLoading(true);
        setChannelFound(true);

        async function loadChannel() {
            const accessToken = localStorage.getItem('accessToken');
            let foundChannelId = null;
            let currentChannelData = null;
            let isUserOwner = false;
            let isUserSubscribed = false;

            try {
                // 1. Obtener datos del canal (por URL o por usuario logueado)
                if (url && url !== 'yourchannel') {
                    const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
                    const response = await fetch(`${VITE_API_URL}/channels/url/${url}`, { headers });
                    if (response.ok) {
                        currentChannelData = await response.json();
                        foundChannelId = currentChannelData.channel_id;
                    } else {
                        setChannelFound(false);
                        setLoading(false);
                        return;
                    }
                } else {
                    if (accessToken) {
                        const response = await fetch(`${VITE_API_URL}/users/me`, {
                            headers: { 'Authorization': `Bearer ${accessToken}` },
                        });
                        if (response.ok) {
                            const userData = await response.json();
                            if (userData.channel) {
                                currentChannelData = userData.channel;
                                foundChannelId = userData.channel.channel_id;
                                // Asumimos propiedad si carga el canal vía /yourchannel (ruta sin URL)
                                isUserOwner = true;
                            }
                        }
                    }
                    if (!foundChannelId) {
                        // Si no hay canal o no está logueado, fallamos silenciosamente o redirigimos (manejo 404/Error)
                        setChannelFound(false);
                        setLoading(false);
                        return;
                    }
                }

                // 2. Comprobar Propiedad y Suscripción (si hay accessToken)
                if (accessToken && foundChannelId) {
                    const userDataResponse = await fetch(`${VITE_API_URL}/users/me`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` },
                    });
                    if (userDataResponse.ok) {
                        const userData = await userDataResponse.json();
                        // Re-comprobamos la propiedad por si se accedió por URL pública
                        isUserOwner = userData.channel && userData.channel.channel_id === foundChannelId;

                        if (!isUserOwner) {
                            // Solo revisamos suscripción si NO es el dueño
                            const subscriptionsResponse = await fetch(`${VITE_API_URL}/subscriptions/user/${userData.user_id}`, {
                                headers: { 'Authorization': `Bearer ${accessToken}` },
                            });
                            if (subscriptionsResponse.ok) {
                                const subscriptions = await subscriptionsResponse.json();
                                isUserSubscribed = subscriptions ? subscriptions.some(sub => sub.channel_id === foundChannelId) : false;
                            }
                        }
                    }
                }

                // 3. Actualizar Estados Finales
                localStorage.setItem('channelId', foundChannelId);
                setChannelId(foundChannelId);
                setChannelData(currentChannelData);
                setIsOwner(isUserOwner);
                setIsSubscribed(isUserSubscribed);
                setChannelFound(true);

            } catch (error) {
                console.error("Error loading channel data:", error);
                setChannelFound(false);
            } finally {
                setLoading(false);
            }
        }
        loadChannel();
    }, [url]);

    // --- RENDERIZADO CONDICIONAL ---
    if (loading) {
        // Mostrar Loader si aún estamos cargando datos
        return <Loader isOverlay={true} />
    }

    if (!channelFound || !channelId) {
        // Mostrar vista de error 404
        return (
            <>
                <Header />
                <Sidebar />
                <main className="main-content error-view" style={{ textAlign: 'center', paddingTop: '50px' }}>
                    <h1>❌ 404 - Channel Not Found</h1>
                    <p>The channel you are looking for does not exist or could not be loaded.</p>
                    <button
                        onClick={() => navigate('/')}
                        style={{ padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}>
                        Go to Homepage
                    </button>
                </main>
            </>
        );
    }

    // Renderizado Normal 
    return (
        <>
            <Header></Header>
            <Sidebar>
            </Sidebar>
            <main className="main-content">
                <Banner channelId={channelId} channelData={channelData} key={`banner-${channelId}`}></Banner>
                <Profile
                    channelId={channelId}
                    channelData={channelData}
                    isOwner={isOwner}
                    isSubscribed={isSubscribed}
                    key={`profile-${channelId}`}
                />

                <ContainerButton
                    containerName="container-button"
                    tabs={tabLabels}
                    activeTabIndex={activeTab}
                    onTabClick={setActiveTab}
                    buttonClass="nav-btn"
                />

                <div className="tab-content-container">
                    {tabContents[activeTab]}
                </div>
            </main>
        </>
    );
}

export default YourChannel;