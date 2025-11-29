import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import './CatubeSubsCard.css'
import { VITE_API_URL } from '../../../config';


export function CatubeSubsCard({ avatar, userName, subscriptions, channelId, isFollowing: initialIsFollowing, channelUrl, isOwner }) {
    const { showSuccess, showError } = useToast();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing || false);
    const [loading, setLoading] = useState(false);
    const [subsCount, setSubsCount] = useState(typeof subscriptions === 'number' ? subscriptions : (parseInt(subscriptions) || 0));

    // Formatear número de suscriptores para mostrar
    const formatSubscriptions = (count) => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    // Chequear si el usuario actual está suscripto a este canal
    useEffect(() => {
        const checkSubscription = async () => {
            const accessToken = localStorage.getItem('accessToken');
            const userId = localStorage.getItem('userId');
            if (!accessToken || !userId || !channelId) return;

            try {
                const res = await fetch(`${VITE_API_URL}/subscriptions/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                });
                if (!res.ok) return; // no autenticado o error
                const channels = await res.json();
                const subscribed = channels.some(c => c.channel_id === channelId || c.channel_id === String(channelId));
                setIsFollowing(subscribed);
            } catch (err) {
                console.error('Error checking subscription:', err);
            }
        };

        checkSubscription();
    }, [channelId]);

    const handleClick = async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            // Aquí podrías redirigir al login o mostrar un modal
            alert('Please log in to subscribe');
            return;
        }

        setLoading(true);
        try {
            if (!isFollowing) {
                // Subscribe
                const res = await fetch(`${VITE_API_URL}/subscriptions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ channelId })
                });
                if (!res.ok) throw new Error('Failed to subscribe');
                setIsFollowing(true);
                setSubsCount(prev => prev + 1);
                showSuccess(`Subscribed to ${userName}!`);
            } else {
                // Unsubscribe
                const res = await fetch(`${VITE_API_URL}/subscriptions`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ channelId })
                });
                if (!res.ok) throw new Error('Failed to unsubscribe');
                setIsFollowing(false);
                setSubsCount(prev => Math.max(0, prev - 1));
                showSuccess(`Unsubscribed from ${userName}`);
            }
        } catch (err) {
            console.error(err);
            showError('An error occurred while updating subscription');
        } finally {
            setLoading(false);
        }
    };

    const text = isFollowing ? 'Catscribed' : 'Catscribe';
    const buttonClassName = isFollowing
        ? 'ct-subsCard-button '
        : 'ct-subsCard-button';

    const content = (
        <article className="ct-subsCard">
            <header className="ct-subsCard-header">
                {channelUrl ? (
                    <Link to={channelUrl}>
                        <img className="ct-subsCard-avatar" src={avatar} alt={`Avatar de ${userName}`} />
                    </Link>
                ) : (
                    <img className="ct-subsCard-avatar" src={avatar} alt={`Avatar de ${userName}`} />
                )}
                <div className="ct-subsCard-info">
                    <Link to={channelUrl} className="ct-subsCard-userName">{userName}</Link>
                    <Link to={channelUrl} className="ct-subsCard-infoUserName">{formatSubscriptions(subsCount)} Catscribers</Link>
                </div>
            </header>

            <aside className="ct-subsCard-aside">
                {!isOwner && (
                    <button className={buttonClassName} onClick={handleClick} disabled={loading}>
                        <span className="ct-subsCard-text">{text}</span>
                        <span className="ct-subsCard-unsubscribe">Unsubscribe</span>
                    </button>
                )}
            </aside>
        </article>
    );

    return content;
}