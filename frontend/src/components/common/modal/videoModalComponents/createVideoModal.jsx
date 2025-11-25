import React, { useState, useEffect } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from "../../../../hooks/useToast.jsx";
import { getAuthToken } from "../../../../utils/auth.js";
import { VITE_API_URL } from "../../../../../config"

const { showSuccess, showError } = useToast();
// ===============================================================
// API: CREATE VIDEO
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

        if (res.status === 201 || res.status === 202) {
            const data = await res.json();
            showSuccess(`Upload started! Processing in background...`);
            return data;
        }

        if (res.ok) {
            return await res.json();
        } else {
            // Intenta obtener el error del cuerpo si está disponible
            const errorData = await res.json().catch(() => ({}));
            showError(errorData.message || "Error creating video");
        }
    } catch (err) {
        console.error("Video creation error", err);
        showError("Network error.");
    }
}

// ===============================================================
// COMPONENTE
// ===============================================================
const CreateVideoModal = ({ onClose, onSubmit }) => {
    const [videoName, setVideoName] = useState("");
    const [videoDescription, setVideoDescription] = useState("");
    const [descriptionError, setDescriptionError] = useState(""); // validation state
    const [videoFile, setVideoFile] = useState("");
    const [videoThumbnail, setVideoThumbnail] = useState("");
    const [defaultTags, setDefaultTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    const [customTagInput, setCustomTagInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [processingStatus, setProcessingStatus] = useState("");

    // ----------------------------------------------------------------------
    // CONSTANTE DE LÍMITE DE CARACTERES
    // ----------------------------------------------------------------------
    const DEFAULT_THUMBNAIL_URL = "https://catube-uploads.s3.sa-east-1.amazonaws.com/thumbnails/default-video-thumbnail.png";
    const MAX_DESCRIPTION_LENGTH = 5000;
    const MAX_TITLE_LENGTH = 100;

    // Handler for description input with max length validation (5000 chars)
    const handleDescriptionChange = (e) => {
        const newDesc = e.target.value;
        if (newDesc.length > MAX_DESCRIPTION_LENGTH) {
            setDescriptionError('Description cannot exceed 5000 characters');
        } else {
            setDescriptionError('');
            setVideoDescription(newDesc);
        }
    };

    // ===============================================================
    // FILTRAR TAGS
    // ===============================================================
    const filteredTags = defaultTags.filter((tag) =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Verificar si existe una coincidencia exacta (no solo parcial)
    const exactMatch = searchTerm.trim() && defaultTags.some((tag) =>
        tag.name.toLowerCase() === searchTerm.toLowerCase().trim()
    );

    // ===============================================================
    // CARGAR TAGS POR DEFECTO
    // ===============================================================
    useEffect(() => {
        fetch(`${VITE_API_URL}/tags?type=default`)
            .then((res) => res.json())
            .then((data) => setDefaultTags(data))
            .catch(() => showError("Could not load default tags"));
    }, []);

    // ===============================================================
    // AGREGAR TAG (fixeado: AHORA AGREGA TODOS)
    // ===============================================================
    const handleAddTag = (tag) => {
        if (!selectedTags.some((t) => t.name === tag.name)) {
            setSelectedTags((prev) => [...prev, tag]);
        }
    };


    // ===============================================================
    // ELIMINAR TAG (fix: AHORA ELIMINA POR ID)
    // ===============================================================

    const handleRemoveTag = (name) => {
        setSelectedTags(prev => prev.filter((t) => t.name !== name));
    };

    // ===============================================================
    // CREAR TAG CUSTOM
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
    // SUBIR VIDEO - MODIFICADO para que thumbnail sea opcional
    // ===============================================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const missingFields = [];
        if (!videoName) missingFields.push("Title");
        if (!videoDescription) missingFields.push("Description");
        if (!videoFile) missingFields.push("Video file");
        // Thumbnail is now OPTIONAL, so we don't check it here

        if (missingFields.length > 0) {
            showError(`Missing: ${missingFields.join(", ")}`);
            return;
        }

        const formData = new FormData();
        formData.append("title", videoName);
        formData.append("description", videoDescription);
        formData.append("video", videoFile);

        // --- INICIO DE LA LÓGICA MODIFICADA PARA EL THUMBNAIL ---
        let thumbnailToSend = videoThumbnail; // Archivo subido por el usuario (File object o null/string)

        // Si no hay archivo de thumbnail subido por el usuario
        if (!videoThumbnail) {
            setProcessingStatus("Fetching default thumbnail...");
            try {
                // 1. Obtiene el archivo predeterminado como un objeto File
                const defaultFile = await urlToFile(
                    DEFAULT_THUMBNAIL_URL,
                    "default-video-thumbnail.png",
                    "image/png"
                );
                thumbnailToSend = defaultFile;  
                showSuccess("Using default thumbnail.");
            } catch (err) {
                console.error("Error fetching default thumbnail", err);
                showError("Could not fetch default thumbnail. Aborting upload.");
                setLoading(false);
                return;
            }
        }

        // 2. Adjunta el archivo (el subido por el usuario o el predeterminado)
        // La validación `if (!videoThumbnail)` ya asegura que si llegamos aquí,
        // `thumbnailToSend` es un objeto File válido (o el subido por el usuario).
        if (thumbnailToSend) {
            formData.append("thumbnail", thumbnailToSend);
        }
        // --- FIN DE LA LÓGICA MODIFICADA PARA EL THUMBNAIL ---

        try {
            setLoading(true);
            setProcessingStatus("Starting upload...");

            const response = await CreateVideoFetch(formData);
            if (!response) {
                setLoading(false);
                return;
            }

            const jobId = response.jobId || response.id;

            // Polling Loop (remains the same)
            const pollInterval = setInterval(async () => {
                // ... polling logic remains the same ...
                try {
                    const statusRes = await fetch(`${VITE_API_URL}/videos/status/${jobId}`);
                    if (!statusRes.ok) return;

                    const statusData = await statusRes.json();
                    setUploadProgress(statusData.progress);
                    setProcessingStatus(`Processing: ${statusData.progress}%`);

                    if (statusData.status === 'completed') {
                        clearInterval(pollInterval);

                        // Asignar Tags (remains the same)
                        await fetch(`${VITE_API_URL}/tags/assign`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${getAuthToken()}`,
                            },
                            body: JSON.stringify({
                                video_id: jobId,
                                tag_ids: selectedTags
                                    .map((t) => t.tag_id)
                                    .filter((id) => id && !id.toString().startsWith("temp-")),
                            }),
                        });

                        const videoRes = await fetch(`${VITE_API_URL}/videos/${jobId}`);
                        const videoData = await videoRes.json();

                        showSuccess("Video processed successfully!");
                        if (onSubmit) onSubmit(videoData);
                        onClose();
                        setLoading(false);
                    } else if (statusData.status === 'failed') {
                        clearInterval(pollInterval);
                        showError("Processing failed.");
                        setLoading(false);
                    }
                } catch (err) {
                    console.error("Polling error", err);
                }
            }, 1000);

        } catch (err) {
            console.error(err);
            showError("Unexpected error.");
            setLoading(false);
        }
    };

    // ===============================================================
    // FILE INPUT PREVIEWS
    // ===============================================================
    const videoPreviewUrl = videoFile
        ? URL.createObjectURL(videoFile)
        : "/assets/videos/";

    // La URL por defecto se usa si videoThumbnail es falsy (string vacío o null)
    const thumbnailPreviewUrl = videoThumbnail
        ? URL.createObjectURL(videoThumbnail)
        : "https://catube-uploads.s3.sa-east-1.amazonaws.com/thumbnails/default-video-thumbnail.png";

    // ===============================================================
    // RENDER
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
                            disabled={loading}
                            maxLength={MAX_TITLE_LENGTH}
                        />
                        <div className="description-counter" style={{ width: '100%', textAlign: 'right', marginTop: '-20px' }}>
                            {videoName.length} / {MAX_TITLE_LENGTH}
                        </div>

                        <h2>Description</h2>
                        <textarea
                            placeholder="Describe your video"
                            value={videoDescription}
                            onChange={handleDescriptionChange}
                            disabled={loading}
                            maxLength={MAX_DESCRIPTION_LENGTH}
                        />
                        <div className="description-counter" style={{ width: '100%', textAlign: 'right', marginTop: '-20px' }}>
                            {videoDescription.length} / {MAX_DESCRIPTION_LENGTH}
                        </div>
                        {descriptionError && <p className="error-text" style={{ color: 'red' }}>{descriptionError}</p>}

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
                                        disabled={loading}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h2>Thumbnail (Optional)</h2> {/* <-- Etiqueta actualizada */}
                                <div className="create-thumbnail">
                                    {/* Mantiene la lógica de previsualización que usa la URL por defecto si no hay archivo */}
                                    <img src={thumbnailPreviewUrl} alt="Thumbnail preview" />
                                    <label htmlFor="upload-thumbnail">Upload</label>
                                    <input
                                        type="file"
                                        id="upload-thumbnail"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setVideoThumbnail(e.target.files?.[0] || null)
                                        }
                                        disabled={loading}
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
                                    disabled={loading}
                                />

                                {filteredTags.length > 0 && (
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
                                                        disabled={loading}
                                                    >
                                                        # {tag.name}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}

                                {/* Mostrar botón de crear tag si no hay coincidencia exacta */}
                                {searchTerm.trim().length > 0 && !exactMatch && (
                                    <div className="no-tags-container">
                                        <p className="no-tags-message">
                                            {filteredTags.length > 0
                                                ? `No exact match for: "${searchTerm}"`
                                                : `No tag found for: "${searchTerm}"`
                                            }
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() => handleAddCustomTag(searchTerm)}
                                            className="create-tag-btn"
                                            disabled={loading}
                                        >
                                            Create tag: #{searchTerm}
                                        </button>
                                    </div>
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
                                                disabled={loading}
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
                            {loading && (
                                <div style={{ width: '100%', marginBottom: '10px' }}>
                                    <div style={{
                                        width: '100%',
                                        height: '10px',
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: '5px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${uploadProgress}%`,
                                            height: '100%',
                                            backgroundColor: '#90b484',
                                            transition: 'width 0.5s ease',
                                            borderRadius: '30px'
                                        }} />
                                    </div>
                                    <p style={{ textAlign: 'center', fontSize: '12px', marginTop: '5px' }}>{processingStatus}</p>
                                </div>
                            )}
                            <div className="create-video-buttons-container">

                                <button
                                    type="button"
                                    className="discard-changes-create-video"
                                    onClick={onClose}
                                >
                                    Discard
                                </button>
                                <button type="submit" className="upload-btn" disabled={loading}>
                                    {loading ? "Processing..." : "Upload"}
                                </button>
                            </div>

                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CreateVideoModal;