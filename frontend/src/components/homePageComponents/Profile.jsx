import { Link } from 'react-router-dom';
import { VITE_API_URL } from '../../../config';

function Profile(props) {
    const firstLetter = props.namechannel?.charAt(0).toUpperCase();

    // Determinar la URL de la foto
    let photoSrc;
    if (props.thumbnail && props.thumbnail.trim() !== '') {
        if (props.thumbnail.startsWith('http://') || props.thumbnail.startsWith('https://')) {
            // Ya es una URL completa (ej. S3)
            photoSrc = props.thumbnail;
        } else if (props.thumbnail.startsWith('/uploads/')) {
            // Ruta interna de backend
            photoSrc = VITE_API_URL + props.thumbnail;
        } else if (props.thumbnail.startsWith('/assets/images/profile/')) {
            // Imagen predeterminada ya mapeada
            photoSrc = props.thumbnail;
        } else if (props.thumbnail.startsWith('/default-avatar/')) {
            // Mapear rutas antiguas a assets
            const letterMatch = props.thumbnail.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : 'A';
            photoSrc = `/assets/images/profile/${letter}.png`;
        } else {
            // Otro tipo de ruta, asumir que es subida
            photoSrc = VITE_API_URL + props.thumbnail;
        }
    } else {
        // Por defecto, primera letra del nombre del canal
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
