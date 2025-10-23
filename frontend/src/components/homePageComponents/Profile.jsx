import { Link } from 'react-router-dom';

function Profile(props) {
    const BASE_URL = 'http://localhost:3000';
    const firstLetter = props.namechannel?.charAt(0).toUpperCase();

    // Mostrar la foto asignada al usuario si existe, sino la que se pasa por props, sino la por defecto
    let photoSrc;
    if (props.photo) {
        let photoPath = props.photo;
        if (photoPath.startsWith('/default-avatar/')) {
            // Map old default-avatar paths to new assets path
            const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : 'A';
            photoPath = `/assets/images/profile/${letter}.png`;
        }
        photoSrc = BASE_URL + photoPath;
    } else {
        photoSrc = props.userPhoto && props.userPhoto.trim() !== '' ? props.userPhoto : `${BASE_URL}/assets/images/profile/${firstLetter}.png`;
    }

    return (
        <Link to={`/yourchannel/${props.url}`}>
            <div className="profile">
                <img className="profile-photo" src={photoSrc} alt={props.namechannel} />
                <p className="name-channel">{props.namechannel}</p>
                <p className="subs-channel">{props.subschannel} Cats</p>
            </div>
        </Link>
    );
}
export default Profile;
