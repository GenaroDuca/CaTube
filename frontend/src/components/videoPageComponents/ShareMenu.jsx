import { useState, useRef, useEffect } from "react";
import { FaShare, FaCopy, FaDownload } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useToast } from "../../hooks/useToast";

import "./ShareMenu.css";

export default function ShareMenu({ videoUrl, videoTitle, friends = [] }) {
    const [open, setOpen] = useState(false);
    const { showSuccess } = useToast();


    const copyToClipboard = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showSuccess("Link copied to clipboard");
    };

    const downloadVideo = () => {
        const a = document.createElement("a");
        a.href = videoUrl;
        a.download = `${videoTitle}.mp4`;
        a.click();
        showSuccess("Video downloaded");
    };

    return (
        <div className="share-wrapper">

            {/* BOTÓN / MENÚ EXPANDIBLE */}
            <div className={`share-expandable ${open ? "open" : ""}`}>

                {/* Si está cerrado solo se ve el botón */}
                {!open && (
                    <button
                        className="share-btn"
                        onClick={() => setOpen(true)}
                    >
                        <FaShare size={20} />
                    </button>
                )}

                {/* Si está abierto, el botón se convierte en menú */}
                {open && (
                    <div className="share-menu-content">
                        <div className="share-menu-header">

                            <h4>Compartir video</h4>                            
                            <button className="close-btn" onClick={() => setOpen(false)}>
                                <IoClose size={18} />
                            </button>
                        </div>

                        <button className="share-option" onClick={copyToClipboard}>
                            <FaCopy size={16} /> Copy link
                        </button>

                        <button className="share-option" onClick={downloadVideo}>
                            <FaDownload size={16} /> Download video
                        </button>

                        <div className="friends-section">
                            <h4>Send to friends</h4>

                            {friends.length === 0 && (
                                <h5 className="no-friends">Dont have any friends yet</h5>
                            )}

                            {friends.map(friend => (
                                <button
                                    key={friend.id}
                                    className="friend-item"
                                    onClick={() => alert(`Compartido con ${friend.name}`)}
                                >
                                    <img src={friend.avatar} alt="friend" />
                                    <span>{friend.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
