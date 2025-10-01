import { latestCommentsData } from '../../../../assets/data/Data'; 
import Subtitle from '../../home/Subtitle';
import CommentItem from './CommentItem';
import Container from "../../hooks/Container";
import NewButton from '../../home/Button';
import { Link } from 'react-router-dom'

function LatestComments() {
    return (
        <Container className="dashboard-card">
            <Subtitle subtitle="Latest comments" />
            {latestCommentsData.map(comment => (
                <CommentItem
                    key={comment.id}
                    userPhoto={comment.userPhoto}
                    username={comment.username}
                    message={comment.message}
                    videoThumbnail={comment.videoThumbnail}
                />
            ))}
            <Link to="/studio?section=community"><NewButton btnclass="btn-dashboard" btntitle="View more"></NewButton></Link>
        </Container>
    );
}

export default LatestComments;