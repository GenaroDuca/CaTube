import ButtonCarousel from "../home/ButtonCarousel";
import Container from "../hooks/Container";
import Video from "../home/Video";
import Short from "../home/Short";

function VideosLatest(props){
    const renderItem = (item, index) => {
        switch (props.type) {
            case 'videos':
                return (
                    <Video
                        key={index}
                        namevideo={item.namevideo}
                        videoviews={item.videoviews}
                        photo={item.photo}
                    />
                );
            case 'shorts':
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

    return(
        <Container id={props.id} className={props.className}>
            <Container className="carousel-container">
                <ButtonCarousel className="carousel-btn left" direction="left" carouselRef={props.ref} />
                <Container className={props.container} id="recommendations-latest" ref={props.ref}>
                    {props.render.map((item, index) => renderItem(item, index))}
                </Container>
                <ButtonCarousel className="carousel-btn right" direction="right" carouselRef={props.ref} />
            </Container>
        </Container>
    );
}

export default VideosLatest;