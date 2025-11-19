import React, { useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { useToast } from "../../../../hooks/useToast.jsx";
import { API_URL } from "../../../../../config"


function EditVideoModal({ onClose, videoId, title: initialTitle, description: initialDescription, thumbnail }) {
    const { showSuccess, showError } = useToast();
    const [formData, setFormData] = useState({
        title: initialTitle || '',
        description: initialDescription || ''
    });
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(thumbnail || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select a valid image file');
                return;
            }

            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('You are not authenticated');
            }

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            
            if (thumbnailFile) {
                formDataToSend.append('thumbnail', thumbnailFile);
            }

            // console.log('Enviando actualización:', {
            //     videoId,
            //     title: formData.title,
            //     description: formData.description,
            //     hasThumbnail: !!thumbnailFile
            // });

            const response = await fetch(`${API_URL}/videos/${videoId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    // No incluir Content-Type cuando se envía FormData
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const text = await response.text();
                let errorMessage;
                try {
                    const data = JSON.parse(text);
                    errorMessage = data.message;
                } catch (e) {
                    errorMessage = text;
                }
                console.error('Error response:', {
                    status: response.status,
                    text: text
                });
                showError(errorMessage || 'Error updating video');
                throw new Error(errorMessage || 'Error updating video');
            }

            const data = await response.json();
            // console.log('Actualización exitosa:', data);
            showSuccess('Video updated successfully');
            setTimeout(() => {
                onClose();
                window.location.reload(); // Reload page to see changes
            }, 1500); // Wait 1.5 seconds so user can see success message
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="right-menu-modal">
            <div className="create-video-content edit-mode">
                <header>
                    <h1>Edit Video</h1>
                    <button type="button" onClick={onClose}>
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    <form onSubmit={handleSubmit}>
                        <h2>Video Title</h2>
                        <div>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Enter video title"
                                required
                            />
                        </div>

                        <h2>Video Description</h2>
                        <div>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter video description"
                            ></textarea>
                        </div>

                        <h2>Video Thumbnail</h2>
                        <div className="create-thumbnail">
                            {thumbnailPreview && (
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail"
                                />
                            )}
                            <div className="thumbnail-upload">
                                <input
                                    type="file"
                                    id="thumbnail"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                    style={{ display: 'none' }}
                                />
                                <label 
                                    htmlFor="thumbnail" 
                                    className="apply-changes-create-video"
                                >
                                    {thumbnailPreview ? 'Change' : 'Upload'}
                                </label>
                            </div>
                        </div>

                        {error && (
                            <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                                {error}
                            </div>
                        )}

                        <div className="create-video-buttons">
                            <button type="button" className="discard-changes-create-video" onClick={onClose}>
                                Discard Changes
                            </button>

                            <button 
                                type="submit" 
                                className="apply-changes-create-video"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default EditVideoModal;