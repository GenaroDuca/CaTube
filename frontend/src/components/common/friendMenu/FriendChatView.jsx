import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IoArrowBackCircle, IoSend, IoCheckmark } from "react-icons/io5";
import { MdDelete, MdEdit } from "react-icons/md";
import { useNotification } from '../../../hooks/useNotification';
import { useModal } from '../modal/ModalContext';
import { useToast } from '../../../hooks/useToast';
import { IoIosCloseCircle } from "react-icons/io";

import {
  getSocket,
  sendMessage,
  fetchMessageHistory,
  getOrCreatePrivateRoom,
  editMessage,
  deleteMessage,
} from './chatApi';
import { getMyUserId } from '../../../utils/auth';

const FriendChatView = ({ friend, onBack, onGoToProfile }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [roomId, setRoomId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const chatWindowRef = useRef(null);
  const myUserId = getMyUserId();

  const { openModal, closeModal } = useModal();
  const { showSuccess } = useToast();
  const { addNotification } = useNotification();

  const userName = useMemo(() => friend?.userName || '', [friend?.userName]);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      requestAnimationFrame(() => {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
      });
    }
  };

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
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
    deleteMessage(messageId);
    closeModal();
  };

  const handleSend = (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !friend.id) return;
    sendMessage(friend.id, content);
    setInput('');
  };

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

        const history = await fetchMessageHistory(room.room_id);

        const mappedHistory = history.map(msg => ({
          ...msg,
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          senderAvatar: msg.senderAvatar || '/default-avatar.png',
          timestamp: new Date(msg.timestamp),
          isEdited: msg.isEdited || false,
        }));

        setMessages(mappedHistory.reverse());
        scrollToBottom();

      } catch (error) {
        console.error("Error al cargar datos del chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatData();
  }, [friend.id]);

  useEffect(() => {
    if (!roomId || !myUserId) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.roomId === roomId) {
        setMessages(prevMessages => {
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
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === updatedMsg.id
              ? { ...msg, content: updatedMsg.content, isEdited: true }
              : msg
          )
        );
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

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  if (isLoading) {
    return <div className="dynamic-view chat-view"><p>Loading chat data...</p></div>;
  }

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
          Talk with{' '}
          <button
            onClick={() => onGoToProfile(friend)}
            className="chat-profile-link"
            title="Go to profile"
          >
            {userName}
          </button>
        </h2>

      </div>

      <div className="chat-window" ref={chatWindowRef}>
        {messages.length === 0 ? (
          <p className="empty-chat-message">Beginning of an epic conversation with {userName}!</p>
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
                    <div className="edit-comment-input">
                      <input
                        type="text"
                        value={editingContent}
                        onChange={handleEditChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitEdit(e);
                          if (e.key === "Escape") setEditingMessageId(null);
                        }}
                        autoFocus
                      />

                      <div className="edit-comment-buttons">
                        <button onClick={submitEdit}>
                          <IoCheckmark size={18} />
                        </button>
                        <button onClick={() => setEditingMessageId(null)}>
                          <IoIosCloseCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="message-content">{msg.content}</p>
                  )}

                  <div className='message-bubble-content-div'>
                    {canTakeAction && (
                      <div className="message-actions">
                        <button
                          onClick={() => startEdit(msg)}
                          title="Edit message"
                          disabled={isEditing}
                        >
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => openModal('confirm', {
                            title: "Delete Message",
                            message: `Are you sure you want to delete this message?`,
                            confirmText: "Delete",
                            onConfirm: () => handleDelete(msg.id),
                          })}
                          title="Delete message"
                        >
                          <MdDelete size={16} />
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
