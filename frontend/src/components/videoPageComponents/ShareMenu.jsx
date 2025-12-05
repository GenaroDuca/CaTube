import { useState, useEffect, useRef } from "react";
import { FaShare, FaCopy, FaDownload } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { useToast } from "../../hooks/useToast";
import { fetchFriendsAndRequests } from "../common/friendMenu/friendShipApi.js";
import { getAuthToken } from "../../utils/auth";
import { getOrCreatePrivateRoom, sendMessage } from "../common/friendMenu/chatApi.js";
import { getSocket } from "../common/friendMenu/chatApi.js";
import Loader from "../../components/common/Loader";

import "./ShareMenu.css";

export default function ShareMenu({ videoUrl, videoTitle }) {
    const [open, setOpen] = useState(false);
    const [friends, setFriends] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showSuccess, showError } = useToast();
    const [sendingTo, setSendingTo] = useState(null);
    const menuRef = useRef(null);

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

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    useEffect(() => {
        let isMounted = true;

        const loadFriends = async () => {
            const token = getAuthToken();
            if (!token) return;

            try {
                const data = await fetchFriendsAndRequests();
                if (!isMounted) return;

                const friendsList = data.friends.map(f => ({
                    id: f.id,
                    name: f.userName,
                    avatar: f.avatarUrl
                }));

                setFriends(friendsList);
            } catch (error) {
                console.error("Error fetching friends:", error);
                if (isMounted) showError("Failed to load friends.");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadFriends();
        return () => { isMounted = false; };
    }, [showError]);

    const shareVideoWithFriend = async (friend) => {
        try {
            setSendingTo(friend.id);
            const url = window.location.href;
            // 1 Enviar el video como texto directamente al usuario (no a la sala)
            await sendMessage(friend.id, url);

            showSuccess(`Video shared with ${friend.name}`);
        } catch (error) {
            console.error("Error sending video:", error);
            showError(`Failed to share video with ${friend.name}`);
        } finally {
            setSendingTo(null);
        }
    };

    return (
        <div className="share-wrapper" ref={menuRef}>
            <div className={`share-expandable ${open ? "open" : ""}`}>
                {!open && (
                    <div
                        className="share-btn"
                        role="button"
                        tabIndex={0}
                        onClick={() => setOpen(true)}
                        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true); }}
                    >
                        <FaShare size={20} />
                    </div>
                )}

                {open && (
                    <div className="share-menu-content" style={{ cursor: "default" }}>
                        <div className="share-menu-header">
                            <h4 style={{ fontSize: "16px", textAlign: "start", color: "#777878" }}>Share Video</h4>
                            <div
                                className="close-btn"
                                role="button"
                                tabIndex={0}
                                onClick={() => setOpen(false)}
                                onKeyDown={(e) => { if (e.key === 'Enter') setOpen(false); }}
                            >
                                <IoClose size={18} />
                            </div>
                        </div>

                        <div
                            className="share-option"
                            role="button"
                            tabIndex={0}
                            onClick={copyToClipboard}
                            onKeyDown={(e) => { if (e.key === 'Enter') copyToClipboard(); }}
                            style={{ color: "#1a1a1b" }}
                        >
                            <FaCopy size={16} /> Copy link
                        </div>

                        <div
                            className="share-option"
                            role="button"
                            tabIndex={0}
                            onClick={downloadVideo}
                            onKeyDown={(e) => { if (e.key === 'Enter') downloadVideo(); }}
                            style={{ color: "#1a1a1b" }}
                        >
                            <FaDownload size={16} /> Download video
                        </div>

                        <div className="friends-section">
                            <h4 style={{ fontSize: "16px", textAlign: "start", color: "#777878" }}>Send to friends</h4>

                            {isLoading && <Loader />}

                            {!isLoading && friends.length === 0 && (
                                <h5 style={{ fontSize: "13px", textAlign: "start", color: "#777878" }} className="no-friends">
                                    Don't have any friends yet
                                </h5>
                            )}

                            {!isLoading && friends.map(friend => (
                                <div
                                    key={friend.id}
                                    className="friend-item"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => shareVideoWithFriend(friend)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') shareVideoWithFriend(friend); }}
                                    style={{ opacity: sendingTo === friend.id ? 0.6 : 1, pointerEvents: sendingTo === friend.id ? 'none' : 'auto', alignItems: 'center' }}
                                >
                                    <img src={friend.avatar} alt={friend.name} />
                                    <span style={{ marginTop: "0", fontSize: 13 }}>{friend.name}</span>
                                    {sendingTo === friend.id && <span style={{ marginLeft: 8, fontSize: 12 }}>Sending...</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
