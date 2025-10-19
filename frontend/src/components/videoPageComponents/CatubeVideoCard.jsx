//Styles
import './VideoCard.css'

//Router
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export function CatubeVideoCard ({id, thumbnail, avatar, userName, title, description}) {
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes('/watch')
    
    //Conditional classes and text
    const cardClassName = isVideoPage
        ? 'ct-videoCard-description watch'
        : 'ct-videoCard-description';

    return (
        <article className="ct-videoCard">
            <header className="ct-videoCard-header">
                <Link to={`/watch/${id}`}>
                    <img className='ct-videoCard-thumbnail' src={thumbnail} alt="thumbnail" />
                </Link>
            </header>
            <div className="ct-videoCard-info">
                <div className="ct-videoCard-infoVideo">
                    <h1 className="ct-videoCard-title">{title}</h1>
                    <p>view • date</p>
                </div>
                <div className="ct-videoCard-infoUser">
                    <div className="ct-videoCard-user">
                        <img className='ct-videoCard-avatar' src={avatar} alt="avatar" />
                        <h3 className="ct-videoCard-infoUserName">{userName}</h3>
                    </div>

                    <p className={cardClassName}>{description}</p>
                </div>
            </div>
        </article>
    )
}