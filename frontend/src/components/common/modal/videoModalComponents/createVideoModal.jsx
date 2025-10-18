import React, { useState } from "react";
import './videoModal.css';
import { IoIosCloseCircle } from "react-icons/io";

const CreateVideoModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '', 
        videoFile: null, 
        thumbnail: null, 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: files[0], 
        }));
    };

    const handleTagChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prevData => ({
            ...prevData,
            tags: selectedOptions, 
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (onSubmit) onSubmit(formData);
        onClose();
    };

    const { title, description, videoFile, thumbnail } = formData;

    const videoPreviewUrl = videoFile ? URL.createObjectURL(videoFile) : "/media/sample-video.mp4";
    const thumbnailPreviewUrl = thumbnail ? URL.createObjectURL(thumbnail) : "@latest/public/example1.jpg";

    return (
        <div className="create-video-modal" onClick={onClose}>
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
                            value={title}
                            name="title" // Add name attribute
                            // Use the handleChange function
                            onChange={handleChange}
                            required
                        />

                        <h2>Description</h2>
                        <textarea
                            placeholder="Describe your video"
                            value={description}
                            name="description" 
                            onChange={handleChange}
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
                                onChange={handleFileChange}
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
                                onChange={handleFileChange}
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