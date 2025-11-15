import Profile from './Profile.jsx'
import Video from './Video.jsx'
import Short from './Short.jsx'
import Container from '../common/Container.jsx'
import Subtitle from './Subtitle.jsx'
import ButtonCarousel from './ButtonCarousel.jsx'
import {Link} from 'react-router-dom'
import { getAuthToken } from '../../utils/auth.js'

import './Sections.css';

function SectionsCarousel(props) {
    const renderItem = (item, index) => {
        switch (props.type) {
            case 'profile':
                return (
                    <Profile
                        key={index}
                        namechannel={item.name}
                        subschannel={item.subs}
                        thumbnail={item.photo}
                        url={item.url}
                    />
                );
            case 'video':
                return (
                    <Link to={`/watch/${item.id}`}>
                    <Video
                        key={index}
                        namevideo={item.title}
                        videoviews={item.views}
                        thumbnail={item.thumbnail}
                    />
                    </Link>
                );
            case 'short':
                return (
                    <Link to={`/shorts/${item.id}`}>
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

export default SectionsCarousel;