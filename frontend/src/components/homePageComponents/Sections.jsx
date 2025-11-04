import Profile from '../homePageComponents/Profile.jsx'
import Video from '../homePageComponents/Video.jsx'
import Short from '../homePageComponents/Short.jsx'
import Container from '../common/Container.jsx'
import Subtitle from '../homePageComponents/Subtitle.jsx'
import ButtonCarousel from '../homePageComponents/ButtonCarousel.jsx'
import {Link} from 'react-router-dom'

function Sections(props) {
    const renderItem = (item, index) => {
        switch (props.type) {
            case 'profile':
                return (
                    <Profile
                        key={index}
                        namechannel={item.name}
                        subschannel={item.subs}
                        photo={item.photo}
                        url={item.url}
                    />
                );
            case 'video':
                return (
                    <Link to={`/watch/${item.id}`}>
                    <Video
                        key={index}
                        namevideo={item.namevideo}
                        videoviews={item.videoviews}
                        photo={item.photo}
                    />
                    </Link>
                );
            case 'short':
                return (
                    <Link to={`/short/${item.id}`}>
                    <Short
                        key={index}
                        nameshort={item.nameshort}
                        shortviews={item.shortviews}
                        photo={item.photo}
                    />
                    </Link>
                );
            default:
                return null;
        }
    };
    return (
        <Container className={props.section}>
            <Subtitle subtitle={props.subtitle} />
            <Container className="carousel-container" >
                <ButtonCarousel className="carousel-btn left" direction="left" carouselRef={props.ref} />
                <Container className={props.cts} ref={props.ref}>
                    {props.render.map((item, index) => renderItem(item, index))}
                </Container>
                <ButtonCarousel className="carousel-btn right" direction="right" carouselRef={props.ref} />
            </Container>
        </Container>
    );
}

export default Sections;