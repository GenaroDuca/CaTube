import React, { useRef, useState, useEffect } from "react";
import "./discoverPage.css";
import Header from "../../components/common/header/Header";
import Sidebar from "../../components/common/Sidebar";
import DiscoverHeader from "../../components/discoverPageComponents/DiscoverHeader";
import { getAuthToken } from "../../utils/auth";
import Container from "../../components/common/Container.jsx";
import Subtitle from "../../components/homePageComponents/Subtitle.jsx";
import Video from "../../components/homePageComponents/Video.jsx";
import { Link, useLocation } from "react-router-dom";

function DiscoverPage() {
    const [videos, setVideos] = useState([]);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [searchTag, setSearchTag] = useState("");
    const [showTagList, setShowTagList] = useState(false);

    const location = useLocation();
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
    // Fetch tags
    // ============================
    useEffect(() => {
        fetch("http://localhost:3000/tags", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setTags(data))
            .catch((err) => console.log(err));
    }, [token]);

    // ============================
    // Fetch videos by tag
    // ============================
    useEffect(() => {
        if (!selectedTag) {
            setVideos([]);
            return;
        }

        fetch(`http://localhost:3000/videos/by-tag/${selectedTag}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setVideos(data))
            .catch((err) => console.log(err));
    }, [selectedTag, token]);

    // ============================
    // Click outside to close menu
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
    // Toggle Tag (solo 1)
    // ============================
    const toggleTag = (tagName) => {
        if (selectedTag === tagName) {
            setSelectedTag(null);
            setVideos([]);
            setSearchTag("");
        } else {
            setSelectedTag(tagName);
            setSearchTag(tagName); // ⬅️ Mostrar tag seleccionado en el input
        }

        setShowTagList(false);
    };

    // ============================
    // Filter displayed tags
    // ============================
    const displayedTags = tags.filter((t) =>
        t.name.toLowerCase().includes(searchTag.toLowerCase())
    );

    return (
        <>
            <Header />
            <Sidebar />

            <main className="main-content">
                <DiscoverHeader />

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

                        {showTagList && (
                            <div className="tags-list">
                                {displayedTags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className={`tag-item ${selectedTag === tag.name ? "selected" : ""
                                            }`}
                                        onClick={() => toggleTag(tag.name)}
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>

                {/* Título con el tag seleccionado */}
                {selectedTag && videos.length > 0 && (
                    <h1 className="selected-tag-title">#{selectedTag}</h1>
                )}

                {/* VIDEOS */}
                <Container className="VideoContainer">
                    <Subtitle subtitle="Videos found" />

                    {/* Mensaje cuando no hay tag seleccionado */}
                    {!selectedTag && (
                        <p className="no-videos">Select a tag to get started.</p>
                    )}

                    {/* Mensaje cuando sí hay tag pero sin resultados */}
                    {selectedTag && videos.length === 0 && (
                        <p className="no-videos">
                            No videos were found for #{selectedTag}.
                        </p>
                    )}

                    {/* Lista de videos */}
                    <Container className="recommendations-container">
                        {videos.map((video) => (
                            <Link to={`/watch/${video.id}`} key={video.id}>
                                <Video
                                    namevideo={video.title}
                                    videoviews={video.viewsLabel}
                                    thumbnail={video.thumbnail}
                                />
                            </Link>
                        ))}
                    </Container>
                </Container>
            </main>
        </>
    );
}

export default DiscoverPage;
