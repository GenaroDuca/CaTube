import { useReaction } from "./useReaction.jsx";
import { FaHeart } from "react-icons/fa";
import { IoHeartDislike } from "react-icons/io5";

export function CommentReaction({ videoId, commentId }) {

    const {
        likes,
        dislikes,
        userReaction,
        react,
        removeReaction
    } = useReaction(videoId, commentId);

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            
            {/* LIKE */}
            <button
                className="like-btn"
                onClick={() =>
                    userReaction === "like" ? removeReaction() : react(true)
                }
            >
                <FaHeart
                    size={20}
                    color={userReaction === "like" ? "#90B484" : "#777878"}
                />
                <span style={{ marginLeft: "6px", color: "var(--text-color)" }}>
                    {likes}
                </span>
            </button>

            {/* DISLIKE */}
            <button
                className="dislike-btn"
                onClick={() =>
                    userReaction === "dislike" ? removeReaction() : react(false)
                }
            >
                <IoHeartDislike
                    size={22}
                    color={userReaction === "dislike" ? "#e96765" : "#777878"}
                />
                <span style={{ marginLeft: "6px", color: "var(--text-color)" }}>
                    {dislikes}
                </span>
            </button>

        </div>
    );
}