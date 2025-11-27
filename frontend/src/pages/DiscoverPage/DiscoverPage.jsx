import React, { useRef, useState, useEffect } from "react";
import "./discoverPage.css";
import Header from "../../components/common/header/Header";
import Sidebar from "../../components/common/Sidebar";
import { getAuthToken } from "../../utils/auth";
import Container from "../../components/common/Container.jsx";
import Subtitle from "../../components/homePageComponents/Subtitle.jsx";
import Video from "../../components/homePageComponents/Video.jsx";
import Short from "../../components/homePageComponents/Short.jsx";
import { Link, useLocation } from "react-router-dom";
import Footer from "../../components/common/Footer.jsx";
import { VITE_API_URL } from '../../../config';
import Loader from '../../components/common/Loader';

function DiscoverPage() {
    const [videos, setVideos] = useState([]);
    const [shorts, setShorts] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchTag, setSearchTag] = useState("");
    const [showTagList, setShowTagList] = useState(false);

    // Estados de Carga
    const [loadingTags, setLoadingTags] = useState(true); // Para la primera carga de tags
    const [loadingContent, setLoadingContent] = useState(false); // Para la carga de videos/shorts por tag
    const [error, setError] = useState(null);

    const location = useLocation();

    // ============================
    // Lógica para tomar el tag de la URL (sin cambios)
    // ============================
    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const tagFromUrl = query.get("tag");

        if (tagFromUrl) {
            setSelectedTag(tagFromUrl);
            setSearchTag(tagFromUrl);
            setShowTagList(false);
        }
    }, [location.search]);

    const tagBoxRef = useRef(null);
    const token = getAuthToken();

    // ============================
    // 1. Fetch tags (Solo al montar el componente)
    // ============================
    useEffect(() => {
        setLoadingTags(true);
        setError(null);

        fetch(`${VITE_API_URL}/tags`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch tags');
                }
                return res.json();
            })
            .then((data) => setTags(data))
            .catch((err) => {
                console.error(err);
                setError(err);
                setTags([]);
            })
            .finally(() => setLoadingTags(false));

    }, [token]);

    // ============================
    // 2. Fetch videos by tag (Cada vez que selectedTag cambia)
    // ============================
    useEffect(() => {
        if (!selectedTag) {
            setVideos([]);
            setShorts([]);
            return;
        }

        setLoadingContent(true); // Inicia la carga del contenido
        setError(null);

        fetch(`${VITE_API_URL}/videos/by-tag/${selectedTag}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch videos by tag');
                }
                return res.json();
            })
            .then((data) => {
                const v = data.filter(item => item.type === 'video' || !item.type);
                const s = data.filter(item => item.type === 'short');
                setVideos(v);
                setShorts(s);
            })
            .catch((err) => {
                console.error(err);
                setError(err);
                setVideos([]);
                setShorts([]);
            })
            .finally(() => setLoadingContent(false)); // Finaliza la carga del contenido

    }, [selectedTag, token]);

    // ============================
    // Click outside to close menu (sin cambios)
    // ============================
    useEffect(() => {
        function handleClickOutside(e) {
            if (tagBoxRef.current && !tagBoxRef.current.contains(e.target)) {
                setShowTagList(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ============================
    // Toggle Tag (sin cambios)
    // ============================
    const toggleTag = (tagName) => {
        if (selectedTag === tagName) {
            setSelectedTag(null);
            setVideos([]);
            setShorts([]);
            setSearchTag("");
        } else {
            setSelectedTag(tagName);
            setSearchTag(tagName);
        }

        setShowTagList(false);
    };

    // ============================
    // Filter displayed tags (sin cambios)
    // ============================
    const displayedTags = tags.filter((t) =>
        t.name.toLowerCase().includes(searchTag.toLowerCase())
    );


    // ============================
    // RENDERIZADO CONDICIONAL DE CARGA PRINCIPAL
    // ============================
    if (loadingTags) {
        return (
            <div className="discover-loading-container">
                <Loader isOverlay={true} />
            </div>
        );
    }

    if (error && !selectedTag) {
        return (
            <div className="error-message">
                <Header />
                <Sidebar />
                <main className="main-content">
                    <h1>Error al cargar las etiquetas.</h1>
                    <p>No se pudo conectar con el servidor de tags.</p>
                </main>
            </div>
        );
    }

    // ============================
    // RENDERIZADO NORMAL
    // ============================
    return (
        <>
            <Header />
            <Sidebar />

            <main className="main-content">
                <div className="title-container">
                    <h1>Discover</h1>
                </div>

                {/* TAG SEARCH */}
                <Container className="tag-search-container">
                    <Subtitle subtitle="Search by tags" />

                    <div ref={tagBoxRef}>
                        <input
                            type="text"
                            placeholder="Search tag..."
                            className="tag-input"
                            value={searchTag}
                            onFocus={() => setShowTagList(true)}
                            onChange={(e) => setSearchTag(e.target.value)}
                        />

                        {/* Lista de Tags (se renderiza incluso si hay error, pero con tags=[] */}
                        {showTagList && (
                            <div className="tags-list">
                                {displayedTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className={`tag-item ${selectedTag === tag.name ? "selected" : ""}`}
                                        onClick={() => toggleTag(tag.name)}
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                                {displayedTags.length === 0 && searchTag && (
                                    <span className="no-tags">No se encontraron tags.</span>
                                )}
                            </div>
                        )}
                    </div>
                </Container>

                {/* CONTENIDO PRINCIPAL (Videos y Shorts) */}
                <div className="discover-content-area">
                    {/* Loader de Contenido Local */}
                    {loadingContent && (
                        <div className="local-content-loader-wrapper">
                            {/* Loader sin isOverlay para que solo cubra el área de videos */}
                            <Loader />
                        </div>
                    )}

                    {/* Título con el tag seleccionado */}
                    {selectedTag && (videos.length > 0 || shorts.length > 0) && (
                        <h1 className="selected-tag-title" style={{color: "var(--btn)"}}>#{selectedTag}</h1>
                    )}

                    {/* SHORTS */}
                    {!loadingContent && selectedTag && shorts.length > 0 && (
                        <Container className="VideoContainer">
                            <Subtitle subtitle="Shorts found" />
                            <Container className="recommendations-container">
                                {shorts.map((short) => (
                                    <Link to={`/shorts/${short.id}`} key={short.id}>
                                        <Short
                                            nameshort={short.title}
                                            shortviews={short.viewsLabel || `${short.views} views`}
                                            thumbnail={short.thumbnail}
                                            createdAt={short.createdAt}
                                        />
                                    </Link>
                                ))}
                            </Container>
                        </Container>
                    )}

                    {/* VIDEOS */}
                    {!loadingContent && (
                        <Container className="VideoContainer">
                            <Subtitle subtitle="Videos found" />

                            {/* Mensaje cuando no hay tag seleccionado */}
                            {!selectedTag && (
                                <p className="no-videos">Select a tag to get started.</p>
                            )}

                            {/* Mensaje cuando sí hay tag pero sin resultados */}
                            {selectedTag && videos.length === 0 && shorts.length === 0 && (
                                <p className="no-videos">
                                    No videos or shorts were found for #{selectedTag}.
                                </p>
                            )}

                            {/* Lista de videos */}
                            {videos.length > 0 && (
                                <Container className="recommendations-container">
                                    {videos.map((video) => (
                                        <Link to={`/watch/${video.id}`} key={video.id}>
                                            <Video
                                                namevideo={video.title}
                                                videoviews={`${video.views} views`}
                                                thumbnail={video.thumbnail}
                                                createdAt={video.createdAt}
                                            />
                                        </Link>
                                    ))}
                                </Container>
                            )}
                        </Container>
                    )}
                </div>
                {/* <Footer footer="footer"></Footer> */}
            </main>
        </>
    );
}

export default DiscoverPage;