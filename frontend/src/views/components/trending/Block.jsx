import Container from "../hooks/Container";
import Subtitle from "../home/Subtitle";

function Block(props){
    return(
        <Container className={props.section}>
            <Subtitle subtitle={props.subtitle} />
            {props.children}
        </Container>
    );
}

export default Block;