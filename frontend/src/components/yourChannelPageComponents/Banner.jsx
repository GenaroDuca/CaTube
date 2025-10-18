import banner from '../../assets/images/yourChannel_media/thumbnails/banner-tv.jpg';

function Banner() {
    return (
        <div className="banner-container">
            <img className="banner" src={banner} alt="banner" />
        </div>
    );
}

export default Banner;