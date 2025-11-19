import Subtitle from "../homePageComponents/Subtitle";
import Container from "../common/Container";
import ContainerButton from "./ContainerButton";
import PublishedContent from "./PublishedContent";
import { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";

function PostsTab({ isOwner, channelId }) {
    const [postContent, setPostContent] = useState("");
    const [publishedPosts, setPublishedPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showSuccess } = useToast();

    useEffect(() => {
        if (channelId) {
            loadPosts();
        }
    }, [channelId]);

    const loadPosts = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:3000/posts/channel/${channelId}`, {
                headers: {
                    'Authorization': accessToken ? `Bearer ${accessToken}` : '',
                },
            });
            if (response.ok) {
                const posts = await response.json();
                setPublishedPosts(posts);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };



    const handlePostNow = async () => {
        if (!postContent.trim() || !channelId) return;

        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            const postData = {
                content: postContent,
                channelId: channelId,
            };

            const response = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify(postData),
            });

            if (response.ok) {
                const newPost = await response.json();
                setPublishedPosts([newPost, ...publishedPosts]);
                setPostContent("");
                showSuccess("Post created successfully!");
            } else {
                alert('Failed to post: ' + response.statusText);
                console.error('Error creating post:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (postId) => {
        setPublishedPosts(publishedPosts.filter(post => post.id !== postId));
    };

    return (
        <>
            <Container className="content-table">
                <Container className="main-content-posts">
                    {isOwner && (
                        <Container className="postsOptions">
                            <Subtitle subtitle="Make your Post" > </Subtitle>
                            <input
                                type="text"
                                className="input-posts"
                                placeholder="Share a sneak peek of your next video"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                            <button
                                className="btn-channel"
                                onClick={handlePostNow}
                                disabled={loading || !postContent.trim()}
                            >
                                {loading ? "Posting..." : "Post now"}
                            </button>

                        </Container>
                    )}
                    <ContainerButton containerName="container-button" buttonClass="nav-btn-posts"></ContainerButton>
                    <div className="post-content-container">
                        <PublishedContent publishedPosts={publishedPosts} onDelete={handleDelete} isOwner={isOwner} />
                    </div>
                </Container>
            </Container>
        </>
    );
}

export default PostsTab;
