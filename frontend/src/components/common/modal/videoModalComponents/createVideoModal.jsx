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

    const videoPreviewUrl = videoFile
        ? URL.createObjectURL(videoFile)
        : "/assets/videos/video-prueba2.mp4";

    const thumbnailPreviewUrl = videoThumbnail
        ? URL.createObjectURL(videoThumbnail)
        : "/assets/example1.jpg";

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
                            // Use formData.title OR destructure it (as done above)
                            value={videoName}
                            name="title" // Add name attribute
                            // Use the handleChange function
                            onChange={(e) => setVideoName(e.target.value)}
                        />

                        <h2>Description</h2>
                        <textarea
                            placeholder="Describe your video"
                            value={videoDescription}
                            name="description"
                            onChange={(e) => setVideoDescription(e.target.value)}
                        />

                        <h2>Video</h2>
                        <div className="create-thumbnail">
                            <video width="300" controls src={videoPreviewUrl}>
                                Your browser does not support the video tag.
                            </video>
                            <label htmlFor="upload-video">Upload</label>
                            <input
                                type="file"
                                id="upload-video"
                                name="videoFile" // Add name attribute matching state field
                                accept="video/mp4"
                                // Use the handleFileChange function
                                onChange={handleVideoFileChange}
                                style={{ display: "none" }}
                            />
                        </div>

                        {/* Updated Thumbnail upload section */}
                        <h2>Video thumbnail</h2>
                        <div className="create-thumbnail">
                            {/* Use the dynamically created URL if a file is selected */}
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

                        {/* <h2>Video tags</h2>
                        <div className="create-video-tags-container">
                            <section>
                                <select 
                                    id="video-tags" 
                                    name="tags" // Add name attribute
                                    multiple
                                    // Handle change using the dedicated function
                                    onChange={handleTagChange}
                                    // Set value based on what's in formData.tags (assumed to be an array)
                                    value={Array.isArray(formData.tags) ? formData.tags : []}
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
                                    />
                                    <button type="button" className="soon">
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </section>
                                                        
                        </div> */}

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