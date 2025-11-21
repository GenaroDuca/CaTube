import { useState, useEffect } from "react";
import { getAuthToken } from "../utils/auth";

export function useReaction(videoId, commentId = null) {
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userReaction, setUserReaction] = useState(null); // 'like' | 'dislike' | null

    const baseUrl = "http://localhost:3000/likes";

    // Fetch current counts
    const fetchCounts = async () => {

        // ⚠️ NEW → URLs adaptadas a NestJS 10 (sin parámetros opcionales)
        const url = commentId
            ? `${baseUrl}/comment/${commentId}`
            : `${baseUrl}/video/${videoId}`;

        const res = await fetch(url);
        const data = await res.json();

        setLikes(data.likes);
        setDislikes(data.dislikes);
    };

    // Send new reaction
    const react = async (isLike) => {
        const token = getAuthToken();

        // ⚠️ NEW → Rutas separadas para video/comment
        const url = commentId
            ? `${baseUrl}/comment/${commentId}`
            : `${baseUrl}/video/${videoId}`;

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ like: isLike })
        });

        if (!res.ok) return;

        setUserReaction(isLike ? "like" : "dislike");
        fetchCounts();
    };

    // Remove reaction
    const removeReaction = async () => {
        const token = getAuthToken();

        // ⚠️ NEW → DELETE usando rutas nuevas
        const url = commentId
            ? `${baseUrl}/comment/${commentId}`
            : `${baseUrl}/video/${videoId}`;

        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) return;

        setUserReaction(null);
        fetchCounts();
    };

    useEffect(() => {
        fetchCounts();
    }, [videoId, commentId]);

    return {
        likes,
        dislikes,
        userReaction,
        react,
        removeReaction
    };
}
