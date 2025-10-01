import Profile from '../home/Profile.jsx'
import Video from '../home/Video.jsx'
import Short from '../home/Short.jsx'
import Container from '../hooks/Container.jsx'
import Subtitle from '../home/Subtitle.jsx'
import ButtonCarousel from '../home/ButtonCarousel.jsx'

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
                    />
                );
            case 'video':
                return (
                    <Video
                        key={index}
                        namevideo={item.namevideo}
                        videoviews={item.videoviews}
                        photo={item.photo}
                    />
                );
            case 'short':
                return (
                    <Short
                        key={index}
                        nameshort={item.nameshort}
                        shortviews={item.shortviews}
                        photo={item.photo}
                    />
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