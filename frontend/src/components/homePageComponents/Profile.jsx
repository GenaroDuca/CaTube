import { Link } from 'react-router-dom';
import { VITE_API_URL } from '../../../config';

function Profile(props) {
    const firstLetter = props.namechannel?.charAt(0).toUpperCase();

    // Mostrar la foto asignada al usuario si existe, sino la que se pasa por props, sino la por defecto
    let photoSrc;
    if (props.thumbnail && props.thumbnail.trim() !== '') {
        let photoPath = props.thumbnail;
        if (photoPath.startsWith('/uploads/')) {
            // Imagen subida por el usuario
            photoSrc = VITE_API_URL + photoPath;
        } else if (photoPath.startsWith('/assets/images/profile/')) {
            // Imagen predeterminada ya mapeada
            photoSrc = photoPath;
        } else if (photoPath.startsWith('/default-avatar/')) {
            // Map old default-avatar paths to new assets path
            const letterMatch = photoPath.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : 'A';
            photoSrc = `/assets/images/profile/${letter}.png`;
        } else {
            // Otro tipo de ruta, asumir que es subida
            photoSrc = VITE_API_URL + photoPath;
        }
    } else {
        photoSrc = `/assets/images/profile/${firstLetter}.png`;
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