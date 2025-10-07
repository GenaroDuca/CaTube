
//Hooks
import { useLocation } from 'react-router-dom';

//Components
import { CatubeVideoCard } from './CatubeVideoCard.jsx'

//Styles
import './VideoList.css'

export function VideoList({videos}) {
    const { pathname } = useLocation();
    const isVideoPage = pathname.includes('/watch')
    
    //Conditional classes and text
    const cardClassName = isVideoPage
        ? 'sr-videosSection watch'
        : 'sr-videosSection';

    return (
        <div className={cardClassName}>
            {videos.map((video) => (
                <CatubeVideoCard 
                key={video.id}
                id={video.id}
                thumbnail={video.thumbnail}
                title={video.title}
                avatar={video.avatar}
                userName={video.userName}
                description={video.description}
                />
            ))}
        </div>
    )
}
