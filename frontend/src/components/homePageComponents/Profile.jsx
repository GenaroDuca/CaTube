import { Link } from 'react-router-dom';
import { VITE_API_URL } from '../../../config';

function Profile(props) {
    const firstLetter = props.namechannel?.charAt(0).toUpperCase();

    // Determinar la URL de la foto
    let photoSrc;
    const thumbnail = props.thumbnail?.trim();

    if (thumbnail) {
        if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
            // Es una URL completa (ej. S3)
            photoSrc = thumbnail;
            console.log("1" + photoSrc);
        } else if (thumbnail.startsWith('/uploads/')) {
            // Ruta interna de backend
            photoSrc = VITE_API_URL + thumbnail;
            console.log("2" + photoSrc);

        } else if (thumbnail.startsWith('/assets/images/profile/')) {
            // Imagen predeterminada ya mapeada
            photoSrc = thumbnail;
            console.log("3" + photoSrc);

        } else if (thumbnail.startsWith('/default-avatar/')) {
            // Mapear rutas antiguas a assets
            const letterMatch = thumbnail.match(/\/default-avatar\/([A-Z])\.png/);
            const letter = letterMatch ? letterMatch[1] : 'A';
            photoSrc = `/assets/images/profile/${letter}.png`;
            console.log("4" + photoSrc);
        } else {
            // Otro tipo de ruta desconocida, asumir backend
            photoSrc = VITE_API_URL + thumbnail;
            console.log("5" + photoSrc);
        }
    } else {
        // Por defecto, primera letra del nombre del canal
        photoSrc = `/assets/images/profile/${firstLetter}.png`;
    }

    return (
        <Link to={`/yourchannel/${props.url}`}>
            <div className="profile">
                <img className="profile-photo" src={"https://catube-uploads.s3.sa-east-1.amazonaws.com/profile/432fb967-f5b9-4d67-97cc-b6c90812add7_sheni.jpg"} alt={props.namechannel} />
                <p className="name-channel">{props.namechannel}</p>
                <p className="subs-channel">{props.subschannel} Cats</p>
            </div>
        </Link>
    );
}

export default Profile;
