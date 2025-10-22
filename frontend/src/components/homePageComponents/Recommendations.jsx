import Container from '../common/Container.jsx'
import Subtitle from '../homePageComponents/Subtitle.jsx'
import Video from '../homePageComponents/Video.jsx'
import { recommendedVideos } from '../../assets/data/Data.jsx';
import { Link } from 'react-router-dom';

function Recommendations() {
    return (
        <Container className="recommendations">
            <Subtitle subtitle="Recommended" />
            <Container className="recommendations-container">
                {recommendedVideos.map((video, index) => (
                    <Link to={`/watch/${video.id}`} key={index}>
                    <Video
                        key={index}
                        namevideo={video.namevideorecommended}
                        videoviews={video.videoviewsrecommended}
                        photo={video.photorecommended}
                    />
                    </Link>
                ))}
            </Container>
        </Container>
    );
}

export default Recommendations;