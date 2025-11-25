import { Link } from 'react-router-dom';

function Profile({ namechannel, subschannel, thumbnail, url }) {
    const firstLetter = namechannel?.charAt(0).toUpperCase();

    let photoSrc;

    if (thumbnail && thumbnail.startsWith('https')) {
        photoSrc = thumbnail;
    }

    if (!thumbnail.startsWith('https')) {
        photoSrc = `https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/${firstLetter}.png`;
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
