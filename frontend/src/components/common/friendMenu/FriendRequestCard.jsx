// src/components/FriendMenu/FriendRequestCard.jsx
import { FaUserPlus} from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

const FriendRequestCard = ({ request, onAccept, onReject }) => {
    const sender = request.sender || { userName: 'Unknown User'};

    return (
        <div className="friend-card pending-request-card">
            <div className="friend-info">
                <div className="avatar-container">
                    <img src={sender.avatarUrl} alt={sender.userName} className="friend-avatar" />
                </div>
                <span className="friend-username">{sender.userName}</span>
            </div>

            <div className="friend-actions">
                <button
                    onClick={() => onAccept(request.id)}
                    title="Accept Friend Request"
                    className="friend-action-button accept-button"
                >
                    <FaUserPlus size={24} color="#90b484" />
                </button>
                <button
                    onClick={() => onReject(request.id)}
                    title="Reject Friend Request"
                    className="friend-action-button reject-button"
                >
                    <MdDelete size={24} color="#e96765" />
                </button>
            </div>
        </div>
    );
};

export default FriendRequestCard;