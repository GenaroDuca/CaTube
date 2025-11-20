import FooterItem from '../homePageComponents/FooterItem.jsx';
import UlContainer from '../homePageComponents/UlContainer.jsx';
import FooterText from '../homePageComponents/FooterText.jsx';
import Container from './Container.jsx';
import { textfooter } from '../../assets/data/Data.jsx';
import './Footer.css';

function Footer() {
    return (
        <Container className="footer">
            <UlContainer className="menu-elem">
                {textfooter.map((item, index) => (
                    <FooterItem key={index} textfooter={item.textfooter} />
                ))}
            </UlContainer>
            <FooterText text="© 2025 CaTube. All rights reserved." />
        </Container>
    );
}

export default Footer;
