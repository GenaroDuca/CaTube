import Container from "../common/Container";
import Subtitle from "../homePageComponents/Subtitle";

function Block(props){
    return(
        <Container className={props.section}>
            <Subtitle subtitle={props.subtitle} />
            {props.children}
        </Container>
    );
}

export default Block;