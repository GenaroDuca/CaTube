// src/components/FriendMenu/FriendChatView.jsx
import { IoArrowBackCircle } from "react-icons/io5";

const FriendChatView = ({ friend, onBack, onGoToProfile }) => (
    <div className="dynamic-view chat-view">
        <button onClick={onBack} className="back-button">
            <IoArrowBackCircle size={28} color="#90b484" />
            <h4>Return to Friends</h4>
        </button>

        <h2>
            Talk with
            <button
                onClick={() => onGoToProfile(friend)}
                className="chat-profile-link"
                title="Ir al perfil"
            >
                {friend.userName}
            </button>
        </h2>

        <div className="chat-window">
            <p>Start an epic conversation with {friend.userName}.</p>
        </div>
    </div>
);

export default FriendChatView;