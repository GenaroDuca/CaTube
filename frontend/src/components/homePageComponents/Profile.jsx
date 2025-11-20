import { Link } from 'react-router-dom';

function Profile({ namechannel, subschannel, thumbnail, url }) {
    const firstLetter = namechannel?.charAt(0).toUpperCase();

    // Determinar la URL final de la foto
    let photoSrc = thumbnail?.trim();

    if (!photoSrc) {
        // Por defecto, mostrar imagen según la primera letra
        photoSrc = `/assets/images/profile/${firstLetter}.png`;
    }

    return (
        <Link to={`/yourchannel/${url}`}>
            <div className="profile">
                <img className="profile-photo" src={photoSrc} alt={namechannel} />
                <p className="name-channel">{namechannel}</p>
                <p className="subs-channel">{subschannel} Cats</p>
            </div>
        </Link>
    );
}

export default Profile;
