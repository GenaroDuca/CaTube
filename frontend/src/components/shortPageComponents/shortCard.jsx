import './shortCard.css'

export function ShortCard({thumbnail, avatar, title, userName}) {
    return (
        <article className="sr-shortCard" >
            <header className="sr-shortCard-header" >
                <img className="sr-shortCard-thumbnail" src={thumbnail} alt="short thumbnail" />
            </header>
            <div className="sr-shortCard-info">
                <div className="sr-shortCard-infoShort">
                    <span className="sr-shortCard-title">{title}</span>
                    <span>view • date</span>
                </div>
            </div>
            <div className="sr-shortCard-infoUser">
                <div className="sr-shortCard-user">
                    <img className="sr-shortCard-avatar" src={avatar} alt="Profile image" />
                    <span className="sr-shortCard-infoUserName">
                        {userName}
                    </span>
                </div>
            </div>
        </article>
    )
}
