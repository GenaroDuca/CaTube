import Container from "../../../hooks/Container";
import NewButton from "../../homePageComponents/Button";
import {lcacommunityData } from "../../../assets/data/Data";

function LcaCommunity() {
    return (
        <Container className="lca-community">
            <NewButton btnclass="btn-community" btntitle="Reply" ></NewButton>
            <Container>
                {lcacommunityData.map((item, idx)=>(
                <img key={idx} src={item.src} alt={item.alt}></img>
                ))}
            </Container>
        </Container>
    );
}

export default LcaCommunity;