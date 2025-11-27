import React, { useState, useEffect } from 'react';
import { VITE_API_URL } from '../../../config';
import { useNavigate } from 'react-router-dom';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import './OfficialSection.css';

const OfficialSection = () => {
    const [officials, setOfficials] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOfficials = async () => {
            try {
                const response = await fetch(`${VITE_API_URL}/channels/official`);
                if (response.ok) {
                    const data = await response.json();
                    setOfficials(data);
                }
            } catch (error) {
                console.error("Error fetching official channels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOfficials();
    }, []);

    if (loading) return null; // Or a skeleton
    if (officials.length === 0) return null;

    return (
        <div className="official-section-container">
            <div className="official-header">
                <h3>Staff Team</h3>
                <div className="official-badge">
                    <RiVerifiedBadgeFill /> Verified
                </div>
            </div>
            <div className="official-grid">
                {officials.map(channel => (
                    <div
                        key={channel.channel_id}
                        className="official-card"
                        onClick={() => navigate(`/yourchannel/${channel.url}`)}
                    >
                        <div className="official-avatar-container">
                            <img
                                src={channel.photoUrl?.startsWith('http') ? channel.photoUrl : VITE_API_URL + channel.photoUrl}
                                alt={channel.channel_name}
                                className="official-avatar"
                            />
                        </div>
                        <div className="official-info">
                            <h4>{channel.channel_name} <RiVerifiedBadgeFill className="official-verified-icon" />
                            </h4>
                            <span className="official-role">
                                {channel.user?.user_type === 'admin' ? 'Admin' : 'Official Account'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OfficialSection;
