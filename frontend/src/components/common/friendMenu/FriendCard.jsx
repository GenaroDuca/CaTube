// src/components/FriendMenu/FriendCard.jsx
import { IoChatbox, IoPersonCircle } from "react-icons/io5";
import { FaUserPlus, FaCircle } from "react-icons/fa";
import { DEFAULT_AVATAR } from './constants'; 

const FriendCard = ({ user, isFriend, onGoToProfile, onGoToChat, onAddFriend }) => {
    const statusColor = user.status === 'online' ? '#90b484' : '#8c8c8c';
    const cardClass = user.status === 'offline' && isFriend ? 'friend-card offline-friend' : 'friend-card';

    const handleCardClick = () => {
        if (isFriend) {
            onGoToProfile(user);
        }
    };

    const handleActionClick = (e, actionFunction) => {
        e.stopPropagation();
        actionFunction(user);
    };

    const handleAddFriend = (e) => {
        e.stopPropagation();
        onAddFriend(user);
    };

    const handleGoToProfileButton = (e) => {
        e.stopPropagation();
        onGoToProfile(user);
    };

    return (
        <div
            className={cardClass + (isFriend ? ' clickable' : '')}
            onClick={isFriend ? handleCardClick : null}
            role={isFriend ? "button" : "listitem"}
            tabIndex={isFriend ? 0 : -1}
            aria-label={isFriend ? `View profile of ${user.userName}` : user.userName}
        >
            <div className="friend-info">
                <div className="avatar-container">
                    <img src={user.avatarUrl || DEFAULT_AVATAR} alt={user.userName} className="friend-avatar" />
                    {isFriend && (
                        <FaCircle
                            className="status-indicator"
                            size={12}
                            style={{ color: statusColor }}
                        />
                    )}
                </div>
                <span className="friend-username">{user.userName}</span>
            </div>

            <div className="friend-actions">
                {isFriend ? (
                    <>
                        <button
                            onClick={handleGoToProfileButton}
                            title="Go to profile"
                            className="friend-action-button profile-button"
                        >
                            <IoPersonCircle size={30} color="#90b484" />
                        </button>

                        <button
                            onClick={(e) => handleActionClick(e, onGoToChat)}
                            title="Send message"
                            className="friend-action-button chat-button"
                        >
                            <IoChatbox size={30} color="#90b484" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={handleAddFriend}
                        title={`Add ${user.userName}`}
                        className="friend-action-button add-friend-button"
                    >
                        <FaUserPlus size={30} color="#90b484" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FriendCard;