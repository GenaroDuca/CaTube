import React, { useMemo } from 'react';
import './shortCard.css';
import { useAuth } from '../../../public/auth/AuthContext.jsx';

export function ShortCard({ short, onToggleMaximize, isActive, onVideoActive }) {
    // Extraemos las props necesarias del objeto short y otras props
    const {
        thumbnail,
        channelAvatar,
        title,
        channelName,
        ownerId,
        channelId
    } = short;

    const { user } = useAuth();
    const currentUserId = user?.id;

    // 💡 Lógica para determinar si el usuario es el dueño del canal del short
    const isOwner = useMemo(() => {
        if (!currentUserId || !ownerId) return false;

        const normalizedCurrentId = String(currentUserId).trim();
        const normalizedOwnerId = String(ownerId).trim();

        return normalizedCurrentId === normalizedOwnerId;
    }, [currentUserId, ownerId]);

    // Nota: El componente ShortPage ya está pasando el objeto 'short', 
    // por lo que he ajustado las props para desestructurar `short`.

    return (
        <article className="sr-shortCard" >
            <header className="sr-shortCard-header" >
                <img className="sr-shortCard-thumbnail" src={thumbnail} alt="short thumbnail" />
            </header>

            <div className="sr-shortCard-info">
                <div className="sr-shortCard-infoShort">
                    <span className="sr-shortCard-title">{title}</span>
                    <span>view • date</span>
                </div>
            </div>

            <div className="sr-shortCard-infoUser">
                <div className="sr-shortCard-user">
                    <img className="sr-shortCard-avatar" src={channelAvatar} alt="Profile image" />
                    <span className="sr-shortCard-infoUserName">
                        {channelName}
                    </span>
                </div>

                {!isOwner && (
                    <button className="sr-subscribe-btn">SUBSCRIBE</button>
                )}
            </div>
        </article>
    );
}