import banner from '../../assets/images/studio_media/catube-pc.png';

function Banner() {
    return (
        <div className="banner-container">
            <img className="banner" src={banner} alt="banner" />
        </div>
    );
}

export default Banner;