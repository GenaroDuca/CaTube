import { useState } from "react";
import '../../../styles/CatubeSubsCard.css'

export function CatubeSubsCard({ avatar, userName, subscriptions, isFollowing: initialIsFollowing }) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    
    const text = isFollowing ? 'Subscribed' : 'Subscribe';
    const buttonClassName = isFollowing
        ? 'ct-subsCard-button is-following'
        : 'ct-subsCard-button';

    const handleClick = () => {
        setIsFollowing(!isFollowing); // Cambia el estado (true/false)
    };

    return (
        <article className="ct-subsCard">
            <header className="ct-subsCard-header">
                <img className="ct-subsCard-avatar" src={avatar} alt={`Avatar de ${userName}`}/>
                <div className="ct-subsCard-info">
                <span className="ct-subsCard-userName">{userName}</span>
                <span className="ct-subsCard-infoUserName">{subscriptions}</span>
                </div>
            </header>

            <aside className="ct-subsCard-aside">
                <button className={buttonClassName} onClick={handleClick}>
                <span className="ct-subsCard-text">{text}</span>
                <span className="ct-subsCard-unsubscribe">Unsubscribe</span>
                </button>
            </aside>
        </article>
    );
}