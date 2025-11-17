import Container from "../common/Container";
import NewButton from "../homePageComponents/Button";

function RowButtons({ btntitle, name, src, onClick, disabled }) {
    return (
        <Container className="row-buttons">
            <NewButton name={name} src={src} onClick={onClick} disabled={disabled}>
                {btntitle}
            </NewButton>
        </Container>
    );
}

export default RowButtons;
