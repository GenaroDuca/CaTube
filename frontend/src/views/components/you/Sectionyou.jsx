import Video from '../home/Video.jsx'
import Container from '../hooks/Container.jsx'
import Subtitle from '../home/Subtitle.jsx'
import ButtonCarousel from '../home/ButtonCarousel.jsx'
import NewButton from '../home/Button.jsx'
import { useState } from 'react'

function Sectionyou(props) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleToggleExpand = () => {
        setIsExpanded(prevState => !prevState);
    };

    return (
        <Container className={props.section}>
            <Container className="container-btn-option">
            <Subtitle subtitle={props.subtitle}/>
            <NewButton btnclass={props.btnclass} onClick={handleToggleExpand}>  {props.btntitle ? (isExpanded ? 'View less' : props.btntitle): props.children}</NewButton>
            </Container>
            <Container className="carousel-container" >
                <ButtonCarousel className="carousel-btn left" direction="left" carouselRef={props.ref} />
                <Container className={props.cts} ref={props.ref}>
                    {props.render.map((item, index) => (
                        <Video
                            key={index}
                            namevideo={item.namevideo}
                            videoviews={item.videoviews}
                            photo={item.photo}
                        />
                    ))}
                </Container>
                <ButtonCarousel className="carousel-btn right" direction="right" carouselRef={props.ref} />
            </Container>
            {isExpanded && props.expandedContent}
        </Container>
    );
}

export default Sectionyou;