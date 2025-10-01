import Container from "../hooks/Container";
import Icons from "./Icons";
import { iconos } from "../../../assets/data/Data";
import RowButtons from "./RowButtons";
import deleted from "../../../assets/media/yourChannel_media/Delete.png"

function RowIcons() {
    return (
        <Container className="row-icons-buttons">
            <Container className="icon-wrapper">
                <Container className="actual-icon-holder">
                    {iconos.map((type, index) => (
                        <Icons
                            key={index}
                            src={type.src}
                            name={type.name}
                        />
                    ))}
                </Container >
            </Container >
            <RowButtons btntitle="Post now" name="delete" src={deleted}></RowButtons>
        </Container >
    );
}
export default RowIcons;

