import React, { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from "../../../../hooks/useToast.jsx";
import { getAuthToken } from "../../../../utils/auth.js";
import { VITE_API_URL } from "../../../../../config"


// ===============================================================
//  API: CREATE VIDEO
// ===============================================================
async function CreateVideoFetch(videoData) {
    const token = getAuthToken();

    try {
        const res = await fetch(`${VITE_API_URL}/videos/create`, {
            method: "POST",
            body: videoData,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 201) {
            const data = await res.json();
            const videoType = data.type === "short" ? "Short" : "Video";
            showSuccess(`${videoType} created successfully!`);
            return data;
        }

        if (res.ok) {
            return await res.json();
        } else {
            showError("Error creating video");
        }
    } catch (err) {
        console.error("Video creation error", err);
        showError("Network error.");
    }
}

// ===============================================================
//  COMPONENTE
// ===============================================================
const CreateVideoModal = ({ onClose, onSubmit }) => {
    const [videoName, setVideoName] = useState("");
    const [videoDescription, setVideoDescription] = useState("");
    const [videoFile, setVideoFile] = useState("");
    const [videoThumbnail, setVideoThumbnail] = useState("");
    const [defaultTags, setDefaultTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [customTagInput, setCustomTagInput] = useState("");
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();

    // ===============================================================
    //  FILTRAR TAGS
    // ===============================================================
    const filteredTags = defaultTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ===============================================================
    //  CARGAR TAGS POR DEFECTO
    // ===============================================================
    useEffect(() => {
        fetch(`${VITE_API_URL}/tags?type=default`)
            .then((res) => res.json())
            .then((data) => setDefaultTags(data))
            .catch(() => showError("Could not load default tags"));
    }, []);

    // ===============================================================
    //  AGREGAR TAG (fixeado: AHORA AGREGA TODOS)
    // ===============================================================
    const handleAddTag = (tag) => {
        if (!selectedTags.some((t) => t.name === tag.name)) {
            setSelectedTags((prev) => [...prev, tag]);
        }
    };


    // ===============================================================
    //  ELIMINAR TAG (fix: AHORA ELIMINA POR ID)
    // ===============================================================

    const handleRemoveTag = (name) => {
        setSelectedTags(prev => prev.filter((t) => t.name !== name));
    };

    // ===============================================================
    //  CREAR TAG CUSTOM
    // ===============================================================
    const handleAddCustomTag = async (nameParam) => {
        // resolver el nombre: param > custom input > searchTerm
        const rawName = (nameParam || customTagInput || searchTerm || "").trim();
        const name = rawName.toLowerCase();
        if (!name) return;

        // evitar duplicados
        const alreadySelected = selectedTags.some((t) => t.name === name);
        if (alreadySelected) {
            showError(`Tag #${name} already selected`);
            return;
        }

        const existsInDefault = defaultTags.some((t) => t.name === name);

        // tempTag para que aparezca al instante
        const tempTag = { tag_id: `temp-${Date.now()}`, name };

        // Añadir inmediatamente
        setSelectedTags((prev) => [...prev, tempTag]);
        if (!existsInDefault) setDefaultTags((prev) => [...prev, tempTag]);

        // Limpio SOLO el input del custom tag, PERO NO el searchTerm
        setCustomTagInput("");

        // Llamada real
        try {
            const res = await fetch(`${VITE_API_URL}/tags`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({ name, type: "custom" }),
            });

            if (!res.ok) {
                // rollback
                setSelectedTags((prev) =>
                    prev.filter((t) => t.tag_id !== tempTag.tag_id)
                );
                if (!existsInDefault) {
                    setDefaultTags((prev) =>
                        prev.filter((t) => t.tag_id !== tempTag.tag_id)
                    );
                }
                showError("Could not create tag");
                return;
            }

            const newTag = await res.json();

            // Reemplazar tempTag con el real
            setDefaultTags((prev) =>
                prev.map((t) => (t.tag_id === tempTag.tag_id ? newTag : t))
            );

            setSelectedTags((prev) =>
                prev.map((t) => (t.tag_id === tempTag.tag_id ? newTag : t))
            );

            // AHORA sí podés limpiar el searchTerm
            setSearchTerm("");

            showSuccess(`Tag #${newTag.name} created`);
        } catch (err) {
            console.error("Network error creating tag", err);

            // rollback
            setSelectedTags((prev) =>
                prev.filter((t) => t.tag_id !== tempTag.tag_id)
            );
            setDefaultTags((prev) =>
                prev.filter((t) => t.tag_id !== tempTag.tag_id)
            );

            showError("Network error while creating tag");
        }
    };


    // ===============================================================
    //  SUBIR VIDEO
    // ===============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const missingFields = [];
        if (!videoName) missingFields.push("Title");
        if (!videoDescription) missingFields.push("Description");
        if (!videoFile) missingFields.push("Video file");
        if (!videoThumbnail) missingFields.push("Thumbnail");

        if (missingFields.length > 0) {
            showError(`Missing: ${missingFields.join(", ")}`);
            return;
        }

        const formData = new FormData();
        formData.append("title", videoName);
        formData.append("description", videoDescription);
        formData.append("video", videoFile);
        formData.append("thumbnail", videoThumbnail);

        try {
            setLoading(true);
            const response = await CreateVideoFetch(formData);
            if (!response) return;

            // ===============================================================
            //  ASIGNAR TAGS AL VIDEO
            // ===============================================================
            await fetch(`${VITE_API_URL}/tags/assign`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getAuthToken()}`,
                },
                body: JSON.stringify({
                    video_id: response.id,
                    tag_ids: selectedTags
                        .map((t) => t.tag_id)
                        .filter((id) => id && !id.toString().startsWith("temp-")),
                }),
            });

            if (onSubmit) onSubmit(response);
            onClose();
        } catch (err) {
            console.error(err);
            showError("Unexpected error.");
        } finally {
            setLoading(false);
        }
    };

    // ===============================================================
    //  FILE INPUT PREVIEWS
    // ===============================================================
    const videoPreviewUrl = videoFile
        ? URL.createObjectURL(videoFile)
        : "/assets/videos/";

    const thumbnailPreviewUrl = videoThumbnail
        ? URL.createObjectURL(videoThumbnail)
        : "/src/assets/images/thumbnails/cooking.jpg";

    // ===============================================================
    //  RENDER
    // ===============================================================
    return (
        <div className="right-menu-modal" onClick={onClose}>
            <div
                className="create-video-content"
                onClick={(e) => e.stopPropagation()}
            >
                <header>
                    <h1>Create Video</h1>
                    <button type="button" onClick={onClose}>
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>

                <main>
                    <form onSubmit={handleSubmit}>
                        <h2>Video title</h2>
                        <input
                            type="text"
                            placeholder="Enter video title"
                            value={videoName}
                            onChange={(e) => setVideoName(e.target.value)}
                        />

                        <h2>Description</h2>
                        <textarea
                            placeholder="Describe your video"
                            value={videoDescription}
                            onChange={(e) => setVideoDescription(e.target.value)}
                        />

                        <div className="create-video-media-input">
                            <div>
                                <h2>Video</h2>
                                <div className="create-thumbnail">
                                    <video width="300" controls src={videoPreviewUrl} />
                                    <label htmlFor="upload-video">Upload</label>
                                    <input
                                        type="file"
                                        id="upload-video"
                                        accept="video/mp4"
                                        onChange={(e) =>
                                            setVideoFile(e.target.files?.[0] || null)
                                        }
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h2>Thumbnail</h2>
                                <div className="create-thumbnail">
                                    <img src={thumbnailPreviewUrl} alt="Thumbnail preview" />
                                    <label htmlFor="upload-thumbnail">Upload</label>
                                    <input
                                        type="file"
                                        id="upload-thumbnail"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setVideoThumbnail(e.target.files?.[0] || null)
                                        }
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* =============================================================== */}
                        {/* TAGS */}
                        {/* =============================================================== */}
                        <h2>Video tags</h2>

                        <div className="create-video-tags-container">
                            {/* ---------- TAGS A LA IZQUIERDA ----------- */}
                            <section>
                                <input
                                    type="text"
                                    placeholder="Search tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />

                                {filteredTags.length > 0 ? (
                                    <ul>
                                        {filteredTags.map((tag) => {
                                            const isSelected = selectedTags.some(
                                                (t) =>
                                                    (t.tag_id && tag.tag_id && t.tag_id === tag.tag_id) ||
                                                    (!t.tag_id && !tag.tag_id && t.name === tag.name)
                                            );

                                            return (
                                                <li key={tag.tag_id || tag.name}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddTag(tag)}
                                                        className={isSelected ? "tag-selected" : ""}
                                                    >
                                                        # {tag.name}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    searchTerm.trim().length > 0 && (
                                        <div className="no-tags-container">
                                            <p className="no-tags-message">
                                                No tag found for: "<strong>{searchTerm}</strong>"
                                            </p>

                                            <button
                                                type="button"
                                                onClick={() => handleAddCustomTag(searchTerm)}
                                                className="create-tag-btn"
                                            >
                                                Create tag: #{searchTerm}
                                            </button>
                                        </div>
                                    )
                                )}
                            </section>

                            {/* ---------- TAGS SELECCIONADOS ----------- */}
                            <section className="tag-input-container">
                                <p> <strong></strong>Assigned tags</p>
                                <ul>
                                    {selectedTags.map((tag) => (
                                        <li key={tag.tag_id}>
                                            {`# ${tag.name} `}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag.name)}
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        {/* =============================================================== */}
                        {/* BOTONES */}
                        {/* =============================================================== */}
                        <div className="create-video-buttons">
                            <button
                                type="button"
                                className="discard-changes-create-video"
                                onClick={onClose}
                            >
                                Discard
                            </button>
                            <button type="submit" className="upload-btn" disabled={loading}>
                                {loading ? "Uploading..." : "Upload"}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CreateVideoModal;
