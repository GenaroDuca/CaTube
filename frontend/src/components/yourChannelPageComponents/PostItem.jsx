import Container from "../common/Container";
import { useModal } from "../common/modal/ModalContext";
import { useToast } from "../../hooks/useToast";
import trash  from "../../assets/images/yourChannel_media/Delete.png";   
import { VITE_API_URL } from '../../../config';

function PostItem({ post, onDelete, isOwner }) {
    const { openModal, closeModal } = useModal();
    const { showSuccess, showError } = useToast();

    const handleDelete = () => {
        openModal('confirm', {
            title: "Delete Post",
            message: `Are you sure you want to delete this post?`,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    const response = await fetch(`${VITE_API_URL}/posts/${post.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                    });

                    if (response.ok) {
                        if (onDelete) {
                            onDelete(post.id);
                        }
                        showSuccess("Post deleted successfully!");
                        closeModal();
                    } else {
                        showError("Failed to delete post.");
                    }
                } catch (error) {
                    console.error('Error deleting post:', error);
                    showError("An error occurred while deleting the post.");
                }
            },
        });
    };

    return (
        <Container className="postsOptions" >
            <div className="post-content" >
                <div className="post-text">
                    <p>{post.content}</p>
                    <small>{new Date(post.createdAt).toLocaleString()}</small>
                </div>
                {isOwner && (
                    <button className="btn-trash"
                        onClick={handleDelete}
                    >
                        <img src={trash} alt="Delete Post" />
                    </button>
                )}
            </div>
        </Container>
    );
}

export default PostItem;
