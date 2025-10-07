import FooterItem  from '../components/homePageComponents/FooterItem.jsx'
import UlContainer from '../components/homePageComponents/UlContainer.jsx'
import FooterText from '../components/homePageComponents/FooterText.jsx'
import Container from './Container.jsx'
import { textfooter } from '../assets/data/Data.jsx';

function Footer(props) {
    return (
        <Container className={props.footer}>
            <UlContainer className="menu-elem">
                {textfooter.map((footer, index) => (
                    <FooterItem
                        key={index}
                        textfooter={footer.textfooter}
                    />
                ))}
            </UlContainer>
            <FooterText text="© 2025 CaTube. All rights reserved." />
        </Container>
    );
}

export default Footer