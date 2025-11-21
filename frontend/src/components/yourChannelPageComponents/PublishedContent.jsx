import Container from "../common/Container";
import PostItem from "./PostItem";


function PublishedContent({ publishedPosts = [], onDelete, isOwner }) {
    return (
            <Container className="content-table-posts">
                {publishedPosts.length > 0 ? (
                    publishedPosts.map(post => (
                        <PostItem  key={post.id} post={post} onDelete={onDelete} isOwner={isOwner} />

                    ))
                ) : (
                    <p className="postsOptions empty-posts">No posts have been published yet</p>
                )}
            </Container>
    );
}

export default PublishedContent;