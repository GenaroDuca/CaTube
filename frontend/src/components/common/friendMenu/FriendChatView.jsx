import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';  // Agrega useMemo
import { IoArrowBackCircle, IoSend, IoCheckmark } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import { useNotification } from '../../../hooks/useNotification';

import {
    getSocket,
    sendMessage,
    fetchMessageHistory,
    getOrCreatePrivateRoom,
    editMessage,
    deleteMessage,
    clearChatHistory
} from './chatApi';
import { getMyUserId } from '../../../utils/auth';

// Constantes de paginación
const MESSAGE_LIMIT = 20;

const FriendChatView = ({ friend, onBack, onGoToProfile }) => {
    // 1. Estados
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [roomId, setRoomId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaginating, setIsPaginating] = useState(false);

    // Estados de paginación
    const [limit] = useState(MESSAGE_LIMIT);
    const [hasMore, setHasMore] = useState(true);

    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingContent, setEditingContent] = useState('');

    const chatWindowRef = useRef(null);
    const myUserId = getMyUserId();

    // NUEVO: Memoiza userName para dependencias estables
    const userName = useMemo(() => friend?.userName || '', [friend?.userName]);

    const { addNotification } = useNotification();

    // 2. Funciones de scroll
    const scrollToBottom = () => {
        if (chatWindowRef.current) {
            requestAnimationFrame(() => {
                chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
            });
        }
    };

    const scrollToPosition = (position) => {
        if (chatWindowRef.current) {
            requestAnimationFrame(() => {
                chatWindowRef.current.scrollTop = position;
            });
        }
    };

    // ----------------------------------------------------
    // LÓGICA DE PAGINACIÓN (Cargar más)
    // ----------------------------------------------------

    const loadMoreMessages = useCallback(async () => {
        if (!roomId || !hasMore || isPaginating) return;

        setIsPaginating(true);
        const currentOffset = messages.length;

        try {
            const newHistory = await fetchMessageHistory(roomId, limit, currentOffset);

            const mappedNewHistory = newHistory.map(msg => ({
                ...msg,
                id: msg.id,
                senderId: msg.senderId,
                senderName: msg.senderName,
                timestamp: new Date(msg.timestamp),
                isEdited: msg.isEdited || false,
            }));

            if (newHistory.length < limit) {
                setHasMore(false);
            }

            const previousScrollHeight = chatWindowRef.current.scrollHeight;
            const reversedNewHistory = mappedNewHistory.reverse();
            setMessages(prevMessages => [...reversedNewHistory, ...prevMessages]);

            setTimeout(() => {
                const newScrollHeight = chatWindowRef.current.scrollHeight;
                const scrollDifference = newScrollHeight - previousScrollHeight;
                scrollToPosition(scrollDifference);
            }, 50);

        } catch (error) {
            console.error("Error al cargar más mensajes:", error);
        } finally {
            setIsPaginating(false);
        }
    }, [roomId, limit, hasMore, isPaginating, messages.length]);

    // ----------------------------------------------------
    // HANDLERS (Edición y Eliminación)
    // ----------------------------------------------------

    const startEdit = (msg) => {
        if (!msg.id) return;
        setEditingMessageId(msg.id);
        setEditingContent(msg.content);
    };

    const handleEditChange = (e) => setEditingContent(e.target.value);

    const submitEdit = (e) => {
        e.preventDefault();
        const content = editingContent.trim();
        if (!content || !editingMessageId) return;

        setMessages(prevMessages =>
            prevMessages.map(msg =>
                msg.id === editingMessageId
                    ? { ...msg, content: content, isEdited: true }
                    : msg
            )
        );

        editMessage(editingMessageId, content);
        setEditingMessageId(null);
        setEditingContent('');
    };

    const handleDelete = (messageId) => {
        if (!messageId) return;

        const isConfirmed = window.confirm(`¿Estás seguro de que quieres eliminar este mensaje?`);
        if (!isConfirmed) return;

        setMessages(prevMessages =>
            prevMessages.filter(msg => msg.id !== messageId)
        );

        deleteMessage(messageId);
    };

    const handleSend = (e) => {
        e.preventDefault();
        const content = input.trim();
        if (!content || !friend.id) return;

        sendMessage(friend.id, content);
        setInput('');
    };

    const handleClearChat = async () => {
        if (!roomId) return;

        const isConfirmed = window.confirm(`ADVERTENCIA: ¿Estás seguro de que quieres eliminar TODO el historial de chat con ${userName}? Esta acción es irreversible y borrará los mensajes para AMBOS usuarios.`);
        if (!isConfirmed) return;

        try {
            await clearChatHistory(roomId);
            setMessages([]);
            setHasMore(true);
            console.log(`El historial de chat con ${userName} ha sido eliminado con éxito.`);
        } catch (error) {
            console.error("Error al eliminar el historial de chat:", error);
        }
    };

    // ----------------------------------------------------
    // Lógica de Carga Inicial (Paginación)
    // ----------------------------------------------------
    useEffect(() => {
        const loadChatData = async () => {
            setIsLoading(true);

            if (!friend || !friend.id) {
                console.error("Error: ID del amigo no disponible.");
                setIsLoading(false);
                return;
            }

            try {
                const room = await getOrCreatePrivateRoom(friend.id);
                setRoomId(room.room_id);

                const history = await fetchMessageHistory(room.room_id, limit, 0);

                let mappedHistory = history.map(msg => ({
                    ...msg,
                    id: msg.id,
                    senderId: msg.senderId,
                    senderName: msg.senderName,
                    senderAvatar: msg.senderAvatar || '/default-avatar.png',
                    timestamp: new Date(msg.timestamp),
                    isEdited: msg.isEdited || false,
                }));

                mappedHistory.reverse();
                setHasMore(history.length === limit);
                setMessages(mappedHistory);
                scrollToBottom();

            } catch (error) {
                console.error("Error al cargar datos del chat:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadChatData();
    }, [friend.id, limit]);

    // ----------------------------------------------------
    // Lógica de Socket
    // ----------------------------------------------------

    useEffect(() => {
        if (!roomId || !myUserId) return;

        const socket = getSocket();
        if (!socket) return;

        const handleNewMessage = (msg) => {
            if (msg.roomId === roomId) {
                setMessages((prevMessages) => {
                    if (prevMessages.some(m => m.id === msg.id)) return prevMessages;
                    return [
                        ...prevMessages,
                        {
                            id: msg.id || Date.now() + Math.random(),
                            content: msg.content,
                            timestamp: new Date(msg.timestamp),
                            senderId: msg.senderId,
                            senderName: msg.senderName || userName,
                            senderAvatar: msg.senderAvatar || '/default-avatar.png',
                            isEdited: msg.is_edited || false,
                        },
                    ];
                });

                if (msg.senderId !== myUserId) {
                    addNotification({
                        type: 'chat-message',
                        userName: msg.senderName || userName,
                        senderId: msg.senderId,
                        senderAvatar: msg.senderAvatar || '/default-avatar.png',
                        linkAction: 'openChat',
                    });
                }
            }
        };

        const handleMessageUpdated = (updatedMsg) => {
            if (updatedMsg.roomId === roomId) {
                setMessages(prevMessages => {
                    return prevMessages.map(msg => {
                        if (msg.id === updatedMsg.id) {
                            return {
                                ...msg,
                                content: updatedMsg.content,
                                isEdited: true
                            };
                        }
                        return msg;
                    });
                });
            }
        };

        const handleMessageDeleted = (deletedMsg) => {
            if (deletedMsg.roomId === roomId) {
                setMessages(prevMessages =>
                    prevMessages.filter(msg => msg.id !== deletedMsg.id)
                );
            }
        };

        socket.on('chat message', handleNewMessage);
        socket.on('message updated', handleMessageUpdated);
        socket.on('message deleted', handleMessageDeleted);

        return () => {
            socket.off('chat message', handleNewMessage);
            socket.off('message updated', handleMessageUpdated);
            socket.off('message deleted', handleMessageDeleted);
        };
    }, [roomId, myUserId, userName, addNotification]);

    // 5. Scroll al final cuando los mensajes se actualizan
    useEffect(() => {
        if (!isPaginating) {
            scrollToBottom();
        }
    }, [messages.length, isPaginating]);

    if (isLoading) {
        return <div className="dynamic-view chat-view"><p>Loading chat data...</p></div>;
    }

    // ----------------------------------------------------
    // 7. Renderizado
    // ----------------------------------------------------

    return (
        <div className="dynamic-view chat-view">
            <div className="chat-header-actions">
                <button onClick={onBack} className="back-button">
                    <IoArrowBackCircle size={28} color="#90b484" />
                    <h4>Return to Friends</h4>
                </button>
            </div>

            <div className='chat-header-flex'>
                <h2>
                    Talk with
                    <button
                        onClick={() => onGoToProfile(friend)}
                        className="chat-profile-link"
                        title="Go to profile"
                    >
                        {userName}
                    </button>
                </h2>
                {roomId && (
                    <button
                        onClick={handleClearChat}
                        className="clear-chat-button"
                        title="Clear chat history"
                    >
                        <MdDelete size={25} color='#777878' />
                    </button>
                )}
            </div>

            <div className="chat-window" ref={chatWindowRef}>
                {hasMore && (
                    <div className="load-more-container">
                        <button
                            onClick={loadMoreMessages}
                            disabled={isPaginating}
                            className="load-more-button"
                        >
                            {isPaginating ? 'Loading...' : '+'}
                        </button>
                    </div>
                )}

                {messages.length === 0 && !hasMore ? (
                    <p className="empty-chat-message">Beginning of an epic conversation with! {userName}</p>
                ) : (
                    messages.map((msg, i) => {
                        const prevMsg = messages[i - 1];
                        const hideSenderName = prevMsg && prevMsg.senderId === msg.senderId;
                        const isMyMessage = msg.senderId === myUserId;
                        const isEditing = msg.id === editingMessageId;
                        const canTakeAction = isMyMessage && msg.id;

                        return (
                            <div
                                key={msg.id || `${msg.content}-${new Date(msg.timestamp).getTime()}`}
                                className={`message ${isMyMessage ? 'my-message' : 'friend-message'} ${hideSenderName ? 'no-sender' : ''}`}
                            >
                                {!hideSenderName && (
                                    <span className="message-sender">
                                        {isMyMessage ? 'You' : msg.senderName}
                                    </span>
                                )}

                                <div className="message-bubble-content">
                                    {isEditing ? (
                                        <form onSubmit={submitEdit} className="edit-form">
                                            <input
                                                type="text"
                                                value={editingContent}
                                                onChange={handleEditChange}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Escape') setEditingMessageId(null);
                                                }}
                                                autoFocus
                                            />
                                            <button type="submit" disabled={!editingContent.trim()}>
                                                <IoCheckmark size={20} title="Confirm Edit" />
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <p className="message-content">{msg.content}</p>
                                        </>
                                    )}

                                    <div className='message-bubble-content-div'>
                                        {canTakeAction && (
                                            <div className="message-actions">
                                                <button
                                                    onClick={() => startEdit(msg)}
                                                    title="Edit message"
                                                    disabled={isEditing}
                                                >
                                                    <MdEdit size={16} title="Edit message" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    title="Delete message"
                                                >
                                                    <MdDelete size={16} title="Delete message" />
                                                </button>
                                            </div>
                                        )}
                                        <span className="message-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.isEdited && <span className="edited-mark"> (edited)</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={handleSend} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Write to ${userName}...`}
                    disabled={!roomId || editingMessageId !== null}
                />
                <button type="submit" disabled={!roomId || input.trim() === '' || editingMessageId !== null}>
                    <IoSend size={20} />
                </button>
            </form>
        </div>
    );
};

export default FriendChatView;
