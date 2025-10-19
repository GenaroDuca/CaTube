//react
import { useMemo } from "react"
//components
import { CatubeSubsCard } from "../user/CatubeSubsCard.jsx"

//styles
import './WatchVideo.css'
import '../user/CatubeSubsCard.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faThumbsUp, faThumbsDown, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

//assets
import Angel from '../../assets/images/profile/angel.jpg'
import Gena from '../../assets/images/profile/gena.jpg'
import Jere from '../../assets/images/profile/jere.jpg'
import Yukki from '../../assets/images/profile/yukki.jpg'

export function WatchVideo ({url, title, avatar, userName, description}) {

    const comments = useMemo(
        () => [
            { id: 1, avatar: Angel, userName: "Colithoxz", content: "Muy buen video" },
            { id: 2, avatar: Gena, userName: "Sheni", content: "Primeroooooo!" },
            { id: 3, avatar: Jere, userName: "Gazzard", content: "Mandame un saludo plssss" },
            { id: 4, avatar: Yukki, userName: "Yukki", content: "Goddddd" },
            ],
            []
        );

    return (
        <article className="vv-displayVideo-container">
            <header className="vv-displayVideo-header"> 
                <video className='vv-displayVideo' src={url} controls></video>
            </header>
            <div>
                <h1 className='vv-displayVideo-title'>{title}</h1>
                <div className="vv-displayVideo-userActions">
                    <CatubeSubsCard avatar={avatar} userName={userName} subscriptions='2.7M' />
                    <section>
                        <button className="like-btn"><FontAwesomeIcon className="like-btn-icon" icon={faThumbsUp}></FontAwesomeIcon></button>
                        <button className="dislike-btn"><FontAwesomeIcon className="dislike-btn-icon" icon={faThumbsDown}></FontAwesomeIcon></button>
                        <button className="options-btn"><FontAwesomeIcon className="options-btn-icon" icon={faEllipsisV}></FontAwesomeIcon></button>
                    </section>
                </div>
            </div>
            <div className="vv-displayVideo-description">
                <p>{description}</p>
            </div>
            <div className="vv-displayVideo-comments">
                <h2>Comments</h2>
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <div className="comment-header">
                            <img className="comment-avatar" src={comment.avatar} alt={`${comment.userName} avatar`} />
                            <h3 className="comment-username">{comment.userName}</h3>
                        </div>
                        <div>
                            <p className="comment-content">{comment.content}</p>
                            <input className='comment-input' type="text" placeholder="reply comment"/>
                        </div>
                    </div>
                ))}
            </div>
        </article>
    )
}

export default WatchVideo;