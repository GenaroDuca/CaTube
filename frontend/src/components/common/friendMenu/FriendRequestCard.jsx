// src/components/FriendMenu/FriendRequestCard.jsx
import { FaUserPlus} from "react-icons/fa6"; // Importar iconos de la misma librería
import { MdDelete } from "react-icons/md";

import { DEFAULT_AVATAR } from './Constants'; // Importar de constantes


const FriendRequestCard = ({ request, onAccept, onReject }) => {
    const sender = request.sender || { userName: 'Unknown User', avatarUrl: DEFAULT_AVATAR };

    return (
        <div className="friend-card pending-request-card">
            <div className="friend-info">
                <div className="avatar-container">
                    <img src={sender.avatarUrl || DEFAULT_AVATAR} alt={sender.userName} className="friend-avatar" />
                </div>
                <span className="friend-username">{sender.userName}</span>
            </div>

            <div className="friend-actions">
                <button
                    onClick={() => onAccept(request.id)}
                    title="Accept Friend Request"
                    className="action-button accept-button"
                >
                    <FaUserPlus size={24} color="#90b484" />
                </button>
                <button
                    onClick={() => onReject(request.id)}
                    title="Reject Friend Request"
                    className="action-button reject-button"
                >
                    <MdDelete size={24} color="#e96765" />
                </button>
            </div>
        </div>
    );
};

export default FriendRequestCard;