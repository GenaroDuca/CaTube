import { useRef } from 'react';
import Profile from './Profile.jsx'
import Video from './Video.jsx'
import Short from './Short.jsx'
import Container from '../common/Container.jsx'
import Subtitle from './Subtitle.jsx'
import ButtonCarousel from './ButtonCarousel.jsx'
import { Link } from 'react-router-dom'
import { getAuthToken } from '../../utils/auth.js'

import './Sections.css';

function SectionsCarousel(props) {
    const internalRef = useRef(null);
    // Use the prop ref if provided (though mostly it won't be), otherwise use internal
    const carouselRef = props.carouselRef || internalRef;

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
                            namevideo={item.namevideo || item.title}
                            videoviews={item.videoviews || item.views}
                            thumbnail={item.thumbnail}
                            createdAt={item.createdAt}
                        />
                    </Link>
                );
            case 'short':
                return (
                    <Link to={`/shorts/${item.id}`}>
                        <Short
                            key={index}
                            nameshort={item.nameshort || item.title}
                            shortviews={item.shortviews || item.views}
                            thumbnail={item.thumbnail}
                            createdAt={item.createdAt}
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
                <ButtonCarousel className="carousel-btn left" direction="left" carouselRef={carouselRef} />
                <Container className={props.cts} ref={carouselRef}>
                    {props.render.map((item, index) => renderItem(item, index))}
                </Container>
                <ButtonCarousel className="carousel-btn right" direction="right" carouselRef={carouselRef} />
            </Container>
        </Container>
    );
}

export default SectionsCarousel;