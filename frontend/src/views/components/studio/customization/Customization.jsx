import Title from "../../Trending/Title";
import Container from "../../hooks/Container";
import CardCustomization from "./CardCustomization";
import InfoContainer from "./InfoContainer";
import angel from "../../../../assets/media/profile/angel.jpg"
import banner from "../../../../assets/media/studio_media/banner-customization.png"

function Customization() {
    return (
        <>
            <Title title="Customization"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="cards-customization-container">
                    <CardCustomization title="Banner image" imageClass="photo-card banner" src={banner} alt="Banner" for="banner-upload"></CardCustomization>
                    <CardCustomization title="Picture" imageClass="photo-card" src={angel} alt="angel" for="picture-upload"></CardCustomization>
                </Container >
                <InfoContainer></InfoContainer>
            </Container >
        </>
    );
}

export default Customization;