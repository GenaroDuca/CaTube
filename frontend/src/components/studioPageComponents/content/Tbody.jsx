import NewButton from "../../homePageComponents/Button";
import Container from "../../common/Container";
import { MdModeEditOutline } from "react-icons/md";
import { useModal } from "../../common/modal/ModalContext";
import { Link } from 'react-router-dom';

function Tbody(props) {
    const { openModal } = useModal();

    return (
        <tbody>
            {props.content.map((item, idx) => (
                <tr key={idx}>
                    <td data-label="Video">
                        <div className="video-content">
                            <Link to={`/watch/${item.id}`}>
                                <img src={item.src} alt={item.alt}></img>
                            </Link>
                            <div className="video-text">
                                <p className="video-title">{item.title}</p>
                                <p className="video-description">{item.description}</p>
                            </div>
                        </div>
                    </td>
                    <td data-label="Visibility">{item.visibility}</td>
                    <td data-label="Restrictions">{item.restrictions}</td>
                    <td data-label="Date">{item.date}<br /><small>Publicado</small></td>
                    <td data-label="Views">{item.views}</td>
                    <td data-label="Comments">{item.comments}</td>
                    <td data-label="Like (%)">{item.like}</td>
                    {props.contentType !== 'Playlists' && (
                        <td>
                            <Container className="edit-video-btn-container">
                                <NewButton 
                                    className="edit-video-btn" 
                                    type="button" 
                                    onClick={() => openModal('editvideo', {
                                        videoId: item.id,
                                        title: item.title,
                                        description: item.description,
                                        thumbnail: item.src,
                                        initialTags: item.tags
                                    })}
                                >
                                    <MdModeEditOutline size={25} color="#1a1a1b" />
                                </NewButton>
                            </Container>
                        </td>
                    )}
                </tr>
            ))}
        </tbody>
    );
}

export default Tbody;