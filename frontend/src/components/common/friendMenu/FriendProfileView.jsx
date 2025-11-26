// src/components/FriendMenu/FriendProfileView.jsx
import { IoChatbox, IoPersonCircle, IoArrowBackCircle } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { DEFAULT_AVATAR } from './constants'; // Importar de constantes
import { useNavigate } from "react-router-dom";
import { useSidebarToggle } from '../../../hooks/useSidebarToggleFriends';

const FriendProfileView = ({ friend, onBack, onGoToChat, onDeleteFriend }) => {
    const navigate = useNavigate();
    const { closeFriendMenu } = useSidebarToggle();

    const goToChannel = () => {
        navigate(`/yourchannel/${friend.channelUrl}`);
        closeFriendMenu();
    };

    return (
        <div className="dynamic-view profile-view">
            <button onClick={onBack} className="back-button">
                <IoArrowBackCircle size={28} color="#90b484" />
                <h4>Return to Friends</h4>
            </button>

            <h2>{friend.userName}</h2>
            <img
                src={friend.avatarUrl || DEFAULT_AVATAR}
                alt={friend.userName}
                className="profile-large-avatar"
            />

            <p className="profile-bio">
                {friend.description || `Hello, I'm ${friend.userName}.`}
            </p>

            <div className="profile-actions-container">
                <button
                    onClick={() => onGoToChat(friend)}
                    className="profile-action-btn chat-btn"
                    title=" Send message"
                >
                    <IoChatbox size={30} color='#90b484' />
                </button>
                <button
                    onClick={goToChannel}
                    className="profile-action-btn channel-btn"
                    title="Go to profile"
                >
                    <IoPersonCircle size={30} color='#90b484' />
                </button>
                <button
                    onClick={() => onDeleteFriend(friend.friendshipId, friend.userName)}
                    className="profile-action-btn remove-btn"
                    title="Delete friend"
                >
                    <MdDelete size={30} color='#e96765' />
                </button>
            </div>
        </div>
    );
};

export default FriendProfileView;