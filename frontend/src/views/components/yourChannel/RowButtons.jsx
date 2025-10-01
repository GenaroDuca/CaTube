import Button from "../home/Button"
import Container from "../hooks/Container";

function RowButtons(props) {
    return (
        <Container className="container-row-buttons">
            <Button btnclass="btn-channel" btntitle={props.btntitle} > </Button>
            <Button btnclass="btn-trash">  
                <img src={props.src} alt={props.name} />
            </Button>
        </Container>
    );
}

export default RowButtons