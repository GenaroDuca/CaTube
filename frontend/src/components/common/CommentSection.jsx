//React
import { useState, useEffect } from "react";

//Hooks
import { useToast } from "../../hooks/useToast.jsx";
import { VITE_API_URL } from "../../../config.js"
import { CommentReaction } from "../../hooks/CommentReaction.jsx";

//JWT Decode
import { jwtDecode } from "jwt-decode";
import { getAuthToken } from "../../utils/auth.js";

//Styles and icons
import { MdDelete, MdEdit } from "react-icons/md";
import { IoIosCloseCircle } from "react-icons/io";
import { FaShare } from "react-icons/fa";
import { IoSend, IoCheckmark } from "react-icons/io5";
import { FaHeart } from "react-icons/fa";
import { IoHeartDislike } from "react-icons/io5";
import "./CommentSection.css";

//Router
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

//Modal
import { useModal } from '../common/modal/ModalContext';

export function CommentSection({ videoId, onCountChange }) {
    // Get current user from token
    const token = getAuthToken();
    const currentUser = token ? jwtDecode(token) : null;

    //Toast notifications
    const { showSuccess, showError } = useToast();

    //Modal 
    const { openModal, closeModal } = useModal();

    //Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    // Nuevo estado para controlar la carga/envío
    const [isSendingComment, setIsSendingComment] = useState(false); // 👈 ¡NUEVO!

    //Editing comments or replies
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingParentCommentId, setEditingParentCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    //Replies
    const [replyingToId, setReplyingToId] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false); // 👈 ¡NUEVO! para replies

    //Replies toggle and display count
    const [openReplies, setOpenReplies] = useState({});
    const [replyDisplayCount, setReplyDisplayCount] = useState({});

    //Router
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes("/watch");

    // Calculate total comments count including replies
    const getTotalCommentsCount = (comments) =>
        comments.reduce(
            (acc, c) => acc + 1 + (Array.isArray(c.replies) ? c.replies.length : 0),
            0
        );

    // Fetch comments on load or video change
    useEffect(() => {
        fetch(`${VITE_API_URL}/comment/${videoId}/comments`)
            .then((res) => res.json())
            .then((data) => {
                if (!Array.isArray(data)) {
                    console.error("Invalid comments format:", data);
                    setComments([]);
                    onCountChange?.(0);
                    return;
                }

                setComments(data);
                onCountChange?.(getTotalCommentsCount(data));
            })
            .catch((err) => {
                console.error("Error fetching comments:", err);
                setComments([]);
                onCountChange?.(0);
            });
    }, [videoId]);

    // Function to send a new comment
    const handleAddComment = async () => {
        if (!token) {
            showError("Please login to comment");
            return;
        }
        if (!newComment.trim()) {
            showError("You cannot send an empty comment");
            return;
        }

        // Desactivar para prevenir spam
        setIsSendingComment(true); // 👈 INICIO DE CARGA

        try {
            const res = await fetch(`${VITE_API_URL}/comment/${videoId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: newComment }),
            });

            const result = await res.json();

            if (res.status === 201) {
                setNewComment("");
                setComments((prev) => {
                    const updated = [result, ...prev];
                    onCountChange?.(getTotalCommentsCount(updated));
                    return updated;
                });
            } else {
                showError(result.message || "Server error");
            }
        } catch (err) {
            console.error("Network error or unexpected failure.");
            showError("Network error or unexpected failure.");
        } finally {
            // Re-activar siempre, independientemente del éxito o fracaso
            setIsSendingComment(false); // 👈 FIN DE CARGA
        }
    };

    // Toggle editing mode
    const startEditing = (comment, parentCommentId = null) => {
        setEditingCommentId(comment.id);
        setEditingParentCommentId(parentCommentId);
        setEditingContent(comment.content);
    };

    // Cancel editing mode
    const cancelEditing = () => {
        setEditingCommentId(null);
        setEditingParentCommentId(null);
        setEditingContent("");
    };

    // Save edited comment or reply
    const handleSaveEdit = async () => {
        const token = getAuthToken();
        try {
            const res = await fetch(
                `${VITE_API_URL}/comment/${videoId}/comments/${editingCommentId}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ content: editingContent }),
                }
            );

            const result = await res.json();
            if (!res.ok) {
                showError(result.message);
                return;
            }

            // Update state
            setComments((prev) =>
                !editingParentCommentId
                    ? prev.map((c) =>
                        c.id === editingCommentId
                            ? { ...c, content: editingContent, updatedAt: result.updatedAt ?? c.updatedAt }
                            : c
                    )
                    : prev.map((c) =>
                        c.id === editingParentCommentId
                            ? {
                                ...c,
                                replies: c.replies.map((r) =>
                                    r.id === editingCommentId
                                        ? { ...r, content: editingContent, updatedAt: result.updatedAt ?? r.updatedAt }
                                        : r
                                ),
                            }
                            : c
                    )
            );

            showSuccess("Comment updated!");
            cancelEditing();
        } catch (err) {
            showError("Error updating comment.");
        }
    };

    // Delete comment or reply
    const handleDeleteComment = async (commentId, parentCommentId = null) => {
        const token = getAuthToken();
        const actionFunction = async () => {
            try {
                const res = await fetch(
                    `${VITE_API_URL}/comment/${videoId}/comments/${commentId}`,
                    {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!res.ok) {
                    const result = await res.json();
                    showError(result.message);
                    return;
                }

                // Update state
                setComments((prev) => {
                    let updated;
                    if (!parentCommentId) {
                        // Delete root comment
                        updated = prev.filter((c) => c.id !== commentId);
                    } else {
                        // Delete reply
                        updated = prev.map((c) =>
                            c.id === parentCommentId
                                ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
                                : c
                        );
                    }

                    // Recalculate total comments count
                    onCountChange?.(getTotalCommentsCount(updated));
                    return updated;
                });

                showSuccess("Comment deleted!");
                closeModal()
            } catch {
                showError("Error deleting comment.");
                closeModal()
            }
        }

        openModal('confirm', {
            title: "Delete Comment",
            message: `Are you sure you want to delete this comment?`,
            confirmText: "Delete",
            onConfirm: actionFunction,
        });
    };

    // Start reply mode
    const startReplying = (commentId) => {
        setReplyingToId(commentId);
        setReplyContent("");
    };

    // Cancel reply
    const cancelReplying = () => {
        setReplyingToId(null);
        setReplyContent("");
    };

    // Function to send reply
    const handleSendReply = async (parentCommentId) => {
        if (!replyContent.trim()) {
            showError("You cannot send an empty reply");
            return;
        }

        const token = getAuthToken();

        // Desactivar para prevenir spam en replies
        setIsSendingReply(true); 

        console.log(replyContent, parentCommentId);

        try {
            const res = await fetch(`${VITE_API_URL}/comment/${videoId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: replyContent, parentCommentId }),
            });

            const result = await res.json();
            if (res.status !== 201) {
                showError(result.message);
                return;
            }

            // Update replies and total count
            setComments((prev) => {
                const updated = prev.map((c) =>
                    c.id === parentCommentId
                        ? { ...c, replies: [...(c.replies || []), result] }
                        : c
                );

                onCountChange?.(getTotalCommentsCount(updated));
                return updated;
            });

            showSuccess("Reply added!");
            cancelReplying();
        } catch {
            showError("Error sending reply.");
        } finally {
            // Re-activar siempre, independientemente del éxito o fracaso
            setIsSendingReply(false); // 👈 FIN DE CARGA DE REPLY
        }
    };

    //Toggle replies visibility
    const toggleReplies = (commentId) => {
        setOpenReplies((prev) => {
            const isOpening = !prev[commentId];

            // If opening → reset to 3
            if (isOpening) {
                setReplyDisplayCount((prevCount) => ({
                    ...prevCount,
                    [commentId]: 3,
                }));
            }

            return {
                ...prev,
                [commentId]: isOpening,
            };
        });
    };


    // Load more replies
    const loadMoreReplies = (commentId) => {
        setReplyDisplayCount((prev) => ({
            ...prev,
            [commentId]: (prev[commentId] || 3) + 3,
        }));
    };

    //Time of comment creation
    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            day: 86400,
            hour: 3600,
            minute: 60,
        };

        for (let key in intervals) {
            const value = intervals[key];
            if (seconds >= value) {
                const time = Math.floor(seconds / value);
                return ` ${time} ${key}${time !== 1 ? "s" : ""} ago`;
            }
        }

        return "A moment ago";
    }

    const cardClassName = isVideoPage
        ? "video-comment"
        : "comment";
    const inputClassName = isVideoPage
        ? "video-add-comment-input"
        : "add-comment-input";
    const editClassName = isVideoPage
        ? "video-edit-comment-input"
        : "edit-comment-input";


    return (
        <div className="comments-section">
            {/* Add new comment */}
            <div className={inputClassName}>
                <input
                    maxLength={160}
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                        // Deshabilitar la tecla "Enter" si se está enviando
                        if (e.key === "Enter" && !isSendingComment) handleAddComment();
                    }}
                    placeholder="Write a comment..."
                    disabled={isSendingComment} // 👈 Deshabilitado durante el envío
                />
                <button
                    onClick={handleAddComment}
                    // Deshabilitado si: 1) Está enviando O 2) El campo está vacío
                    disabled={isSendingComment || !newComment.trim()} // 👈 Deshabilitado durante el envío
                >
                    <IoSend size={18} />
                </button>
            </div>
            <div className="comments-list">
                {comments.length === 0 ? (
                    <p style={{ textAlign: "center", color: "var(--text)" }}>
                        No comments yet
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={cardClassName}>
                            {/* Profile link */}
                            <Link
                                to={comment.channelUrl ? `/yourchannel/${comment.channelUrl}` : "#"}
                                className="comment-channel-link"
                            >
                                <img
                                    src={
                                        comment.photoUrl
                                            ? `${comment.photoUrl}`
                                            : `/assets/images/profile/${comment.username?.charAt(0).toUpperCase()}.png`
                                    }
                                    alt={comment.username || "User avatar"}
                                    className="comment-avatar"
                                />

                                <p>
                                    <strong>{comment.username || "Unknown user"}</strong>
                                </p>
                            </Link>

                            {/* Edit mode */}
                            {editingCommentId === comment.id ? (
                                <div className={editClassName}>
                                    <input
                                        maxLength={160}
                                        type="text"
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleSaveEdit();
                                            if (e.key === "Escape") cancelEditing();
                                        }}
                                        autoFocus
                                    />
                                    <div className="edit-comment-buttons">
                                        <button onClick={handleSaveEdit}>
                                            <IoCheckmark size={18} />
                                        </button>
                                        <button onClick={cancelEditing}>
                                            <IoIosCloseCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p>{comment.content}</p>
                            )}

                            <div className="comment-footer">
                                {/* Actions */}
                                <div className="comment-actions">
                                    {currentUser?.id === comment.user_id && (
                                        <>
                                            <button onClick={() => startEditing(comment)}>
                                                <MdEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteComment(comment.id)}>
                                                <MdDelete size={18} />
                                            </button>
                                        </>
                                    )}
                                    {/* Comments reactions */}
                                    <CommentReaction videoId={videoId} commentId={comment.id} />
                                    <button
                                        className="reply"
                                        onClick={() => startReplying(comment.id)}
                                    >
                                        <FaShare className="reply-icon" size={18} />
                                    </button>
                                </div>
                                {/* Time */}
                                <p className="comment-date">
                                    {new Date(comment.updatedAt).getTime() !==
                                        new Date(comment.createdAt).getTime()
                                        ? <>Edited {timeAgo(comment.updatedAt)}</>
                                        : <> {timeAgo(comment.createdAt)}</>}
                                </p>
                            </div>


                            {/* Reply input */}
                            {replyingToId === comment.id && (
                                <div className="reply-input">
                                    <input
                                        maxLength={160}
                                        type="text"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            // Deshabilitar la tecla "Enter" si se está enviando
                                            if (e.key === "Enter" && !isSendingReply) handleSendReply(comment.id);
                                        }}
                                        placeholder={`Reply to ${comment.username}...`}
                                        autoFocus
                                        disabled={isSendingReply} // 👈 Deshabilitado durante el envío de reply
                                    />
                                    <button
                                        onClick={() => handleSendReply(comment.id)}
                                        // Deshabilitado si: 1) Está enviando O 2) El campo está vacío
                                        disabled={isSendingReply || !replyContent.trim()} // 👈 Deshabilitado durante el envío de reply
                                    >
                                        <IoSend size={18} />
                                    </button>
                                    <button onClick={cancelReplying} disabled={isSendingReply}>
                                        <IoIosCloseCircle size={20} />
                                    </button>
                                </div>
                            )}

                            {/* Render replies */}
                            {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                                <>
                                    {/* Toggle replies button */}
                                    <button
                                        className="toggle-replies-btn"
                                        onClick={() => toggleReplies(comment.id)}
                                    >
                                        {openReplies[comment.id]
                                            ? `▲ Hide replies`
                                            : `▼ View replies (${comment.replies.length})`}
                                    </button>

                                    {/* Visible replies */}
                                    {openReplies[comment.id] && (
                                        <div className="replies-list">
                                            {comment.replies.slice(0, replyDisplayCount[comment.id]).map((reply) => (
                                                <div key={reply.id} className="reply">
                                                    {/* Reply link */}
                                                    <Link
                                                        to={
                                                            reply.channelUrl
                                                                ? `/yourchannel/${reply.channelUrl}`
                                                                : "#"
                                                        }
                                                        className="comment-channel-link"
                                                    >
                                                        <img
                                                            src={
                                                                reply.photoUrl
                                                                    ? `${reply.photoUrl}`
                                                                    : `/assets/images/profile/${reply.username.charAt(
                                                                        0
                                                                    )}.png`
                                                            }
                                                            alt={reply.username || "User avatar"}
                                                            className="comment-avatar"
                                                        />
                                                        <p>
                                                            <strong>{reply.username || "Unknown user"}</strong>
                                                            <span className="reply-to">
                                                                {comment.username ? ` (reply to ${comment.username})` : ""}
                                                            </span>
                                                        </p>
                                                    </Link>

                                                    {/* Reply content */}
                                                    {editingCommentId === reply.id ? (
                                                        <div className={editClassName}>
                                                            <input
                                                                maxLength={160}
                                                                type="text"
                                                                value={editingContent}
                                                                onChange={(e) => setEditingContent(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter") handleSaveEdit();
                                                                    if (e.key === "Escape") cancelEditing();
                                                                }}
                                                                autoFocus
                                                            />
                                                            <div className="edit-comment-buttons">
                                                                <button onClick={handleSaveEdit}>
                                                                    <IoCheckmark size={18} />
                                                                </button>
                                                                <button onClick={cancelEditing}>
                                                                    <IoIosCloseCircle size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p>{reply.content}</p>
                                                    )}

                                                    {/* Time */}
                                                    <p className="comment-date">
                                                        {new Date(reply.updatedAt).getTime() !==
                                                            new Date(reply.createdAt).getTime()
                                                            ? <>Edited {timeAgo(reply.updatedAt)}</>
                                                            : <> {timeAgo(reply.createdAt)}</>}
                                                    </p>

                                                    {/* Reply actions */}
                                                    <div className="comment-actions">
                                                        {currentUser?.id === reply.user_id && (
                                                            <>
                                                                <button onClick={() =>
                                                                    startEditing(reply, comment.id)
                                                                }>
                                                                    <MdEdit size={18} />
                                                                </button>
                                                                <button onClick={() =>
                                                                    handleDeleteComment(reply.id, comment.id)
                                                                }>
                                                                    <MdDelete size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {/* Reply reactions */}
                                                        <CommentReaction videoId={videoId} commentId={reply.id} />
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Load more replies button */}
                                            {replyDisplayCount[comment.id] < comment.replies.length && (
                                                <button
                                                    className="see-more-btn"
                                                    onClick={() => loadMoreReplies(comment.id)}
                                                >
                                                    View more
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>


        </div>
    );
}