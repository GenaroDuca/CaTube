import React, { useState } from "react";
import './videoModal.css';
import { IoIosCloseCircle } from "react-icons/io";


function EditVideoModal({ onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: '',
        videoFile: '',
        thumbnail: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(formData);
        onClose();
    };

    return (
        <div className="create-video-modal">
            <div className="create-video-content edit-mode">
                <header>
                    <h1>Edit Video</h1>
                    <button type="button" onClick={onClose}>
                        <IoIosCloseCircle size={25} color="#1a1a1b" />
                    </button>
                </header>
                <main>
                    <h2>Video title</h2>
                    <div>
                        <input
                            type="text"
                            id="video-title"
                            placeholder="current title current title current title"
                            defaultValue="current title current title current title"
                        />
                    </div>

                    <h2>Video description</h2>
                    <div>
                        <textarea
                            id="video-description"
                            placeholder="Video description"
                            defaultValue="Video description Video description Video description"
                        ></textarea>
                    </div>

                    <h2>Video thumbnail</h2>
                    <div className="create-thumbnail">
                        <img
                            src="/media/sample-thumbnail.jpg"
                            alt="Thumbnail"
                        />
                        <label htmlFor="edit-thumbnail">Upload</label>
                        <input
                            type="file"
                            id="edit-thumbnail"
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* <h2>Video tags</h2>
                    <div className="create-video-tags-container">
                        <section>
                            <select id="video-tags" name="video-tags" multiple>
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
                                <input type="text" id="custom-tag" placeholder="Enter your tag" />
                                <button type="button" className="soon">
                                    <i className="fas fa-plus"></i>
                                </button>
                            </div>
                        </section>

                        <section>
                            <select id="video-tags" name="video-tags" multiple>
                                <option value="music">#music</option>
                                <option value="vlog">#vlog</option>
                                <option value="cooking">#cooking</option>
                                <option value="nashe">#nashe</option>
                                <option value="idooo">#idooo</option>
                            </select>
                        </section>
                    </div> */}

                    <div className="create-video-buttons">
                        <button type="button" className="discard-changes-create-video">
                            Discard changes
                        </button>

                        <button type="button" className="apply-changes-create-video">
                            Apply changes
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default EditVideoModal;