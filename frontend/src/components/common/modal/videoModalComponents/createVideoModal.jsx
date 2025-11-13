import React, { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from "../../../../hooks/useToast.jsx";
import { getAuthToken } from "../../../../utils/auth.js";


const { showSuccess, showError } = useToast();
// Función para crear el video
/**
@param {FormData} videoData - Datos del video, incluyendo el archivo de imagen.
@returns {Promise<object|null>} El producto creado o null si falla.*/

async function CreateVideoFetch(videoData) {
    const token = getAuthToken();

    try {
        const res = await fetch('http://localhost:3000/videos/create', {
            method: 'POST',
            body: videoData,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (res.status === 201) {
            const videoData = await res.json();
            const videoType = videoData.type === 'short' ? 'Short' : 'Video';
            showSuccess(`${videoType} created successfully!`)
            return videoData;
        }



        if (res.ok) {
            return await res.json();
        } else {
            console.error('Error del backend:', res);
            showError('Error creating video: ' + (res.message || 'Server error'));
        }
    } catch (err) {
        console.error('The video was not created correctly', err);
        showError('Network error or unexpected failure.');
    }
};


const CreateVideoModal = ({ onClose, onSubmit }) => {
    const [videoName, setVideoName] = useState('');
    const [videoDescription, setVideoDescription] = useState('');
    const [videoFile, setVideoFile] = useState('');
    const [videoThumbnail, setVideoThumbnail] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [customTagInput, setCustomTagInput] = useState('');

    const handleVideoFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleThumbnailFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVideoThumbnail(e.target.files[0]);
        }
    };

    const handleAddCustomTag = async () => {
        const tag = customTagInput.trim().toLowerCase();
        if (!tag || selectedTags.includes(tag)) return;

        try {
            const res = await fetch('http://localhost:3000/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ name: tag, type: 'custom' })
            });

            if (res.ok) {
                setSelectedTags((prev) => [...prev, tag]);
                setCustomTagInput('');
                showSuccess(`Tag #${tag} created`);
            } else {
                showError('Could not create tag');
            }
        } catch (err) {
            showError('Network error while creating tag');
        }
    };

    const handleTagChange = (e) => {
        const options = Array.from(e.target.selectedOptions);
        const values = options.map((opt) => opt.value);
        setSelectedTags(values);
    };


    const videoPreviewUrl = videoFile
        ? URL.createObjectURL(videoFile)
        : "/assets/videos/";

    const thumbnailPreviewUrl = videoThumbnail
        ? URL.createObjectURL(videoThumbnail)
        : "/src/assets/images/thumbnails/cooking.jpg";

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🚨 VALIDACIÓN DE LOS 4 CAMPOS OBLIGATORIOS 🚨
        const missingFields = [];

        if (!videoName) missingFields.push('Title');
        if (!videoDescription) missingFields.push('Description');
        if (!videoFile) missingFields.push('Video file');
        if (!videoThumbnail) missingFields.push('Thumbnail image');

        if (missingFields.length > 0) {
            showError(`The following fields are required: ${missingFields.join(', ')}`);
            return;
        }

        const formData = new FormData();
        formData.append('title', videoName);
        formData.append('description', videoDescription);
        formData.append('video', videoFile);
        formData.append('thumbnail', videoThumbnail);

        try {
            const response = await CreateVideoFetch(formData);

            if (response) {
                if (onSubmit) onSubmit(response);
                onClose();
            }

        } catch (error) {
            console.error(error.message);
            showError('An unexpected error occurred.');
        }

        if (response?.id) {
            await fetch('http://localhost:3000/tags/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({
                    videoId: response.id,
                    tagNames: selectedTags
                })
            });
        }

    };

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
                            name="title"
                            onChange={(e) => setVideoName(e.target.value)}
                        />

                        <h2>Description</h2>
                        <textarea
                            placeholder="Describe your video"
                            value={videoDescription}
                            name="description"
                            onChange={(e) => setVideoDescription(e.target.value)}
                        />
                        <div className="create-video-media-input">
                            <div>
                                <h2>Video</h2>
                                <div className="create-thumbnail">
                                    <video width="300" controls src={videoPreviewUrl}>
                                        Your browser does not support the video tag.
                                    </video>
                                    <label htmlFor="upload-video">Upload</label>
                                    <input
                                        type="file"
                                        id="upload-video"
                                        name="videoFile"
                                        accept="video/mp4"
                                        onChange={handleVideoFileChange}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>

                            <div>
                                <h2>Video thumbnail</h2>
                                <div className="create-thumbnail">
                                    <img src={thumbnailPreviewUrl} alt="Thumbnail preview" />
                                    <label htmlFor="upload-thumbnail">Upload</label>
                                    <input
                                        type="file"
                                        id="upload-thumbnail"
                                        name="thumbnail"
                                        accept="image/*"
                                        onChange={handleThumbnailFileChange}
                                        style={{ display: "none" }}
                                    />
                                </div>
                            </div>
                        </div>
                        <h2>Video tags</h2>
                        <div className="create-video-tags-container">
                            <section>
                                <select
                                    id="video-tags"
                                    name="tags"
                                    multiple
                                    onChange={handleTagChange}
                                    value={selectedTags}
                                >
                                    <option value="music">#music</option>
                                    <option value="vlog">#vlog</option>
                                    <option value="cooking">#cooking</option>
                                    <option value="nashe">#nashe</option>
                                    <option value="idooo">#idooo</option>
                                </select>
                            </section>

                            <section className="tag-input-container">
                                <span>Create your own tag</span>
                                <div>
                                    <input
                                        type="text"
                                        id="custom-tag"
                                        placeholder="Enter your tag"
                                        value={customTagInput}
                                        onChange={(e) => setCustomTagInput(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddCustomTag}>
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </section>
                        </div>
                        <div className="create-video-buttons">
                            <button type="button" className="discard-changes-create-video" onClick={onClose}>
                                Discard
                            </button>
                            <button type="submit" className="upload-btn">
                                Upload
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CreateVideoModal;