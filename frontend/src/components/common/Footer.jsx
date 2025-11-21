import FooterItem from '../homePageComponents/FooterItem.jsx';
import UlContainer from '../homePageComponents/UlContainer.jsx';
import FooterText from '../homePageComponents/FooterText.jsx';
import Container from './Container.jsx';
import { textfooter } from '../../assets/data/Data.jsx';
import './Footer.css';

function Footer(prop) {
    return (
        <Container className={prop.footer}>
            <Container>
                <UlContainer className="menu-elem">
                    {textfooter.map((item, index) => (
                        <FooterItem key={index} textfooter={item.textfooter} />
                    ))}
                </UlContainer>
                <FooterText text="© 2025 CaTube. All rights reserved." />
            </Container>
        </Container>
    );
}

export default Footer;
