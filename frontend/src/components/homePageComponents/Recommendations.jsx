import Container from '../../hooks/Container.jsx'
import Subtitle from '../homePageComponents/Subtitle.jsx'
import Video from '../homePageComponents/Video.jsx'
import { recommendedVideos } from '../../assets/data/Data.jsx';

function Recommendations() {
    return (
        <Container className="recommendations">
            <Subtitle subtitle="Recommended" />
            <Container className="recommendations-container">
                {recommendedVideos.map((video, index) => (
                    <Video
                        key={index}
                        namevideo={video.namevideorecommended}
                        videoviews={video.videoviewsrecommended}
                        photo={video.photorecommended}
                    />
                ))}
            </Container>
        </Container>
    );
}

export default Recommendations;