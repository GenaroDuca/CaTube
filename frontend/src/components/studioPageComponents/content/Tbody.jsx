import NewButton from "../../homePageComponents/Button";
import Container from "../../common/Container";
import { MdModeEditOutline } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useModal } from "../../common/modal/ModalContext";
import { Link } from 'react-router-dom';
import { VITE_API_URL } from "../../../../config";

function Tbody(props) {
    const { openModal } = useModal();
    return (
        <tbody>
            {props.content.map((item, idx) => (
                <tr key={idx}>
                    <td data-label="Video">
                        <div className="video-content">
                            <Link to={props.contentType === 'Shorts' ? `/shorts/${item.id}` : `/watch/${item.id}`}>
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
                    <td data-label="Like">{item.like}</td>
                    {props.contentType !== 'Playlists' && (
                        <td>
                            <Container className="edit-video-btn-container">
                                <NewButton
                                    btnclass="edit-video-btn"
                                    type="button"
                                    onClick={() => {
                                        openModal('editvideo', {
                                            videoId: item.id,
                                            title: item.title,
                                            description: item.description,
                                            thumbnail: item.src,
                                            initialTags: item.tags,
                                            contentType: props.contentType
                                        })
                                    }}
                                >
                                    <MdModeEditOutline size={25} color="#1a1a1b" />
                                </NewButton>
                                <NewButton
                                    btnclass="delete-video-btn"
                                    type="button"
                                    onClick={() => openModal('confirm', {
                                        title: props.contentType === 'Shorts' ? 'Delete Short' : 'Delete Video',
                                        message: `Are you sure you want to delete the ${props.contentType === 'Shorts' ? 'short' : 'video'} "${item.title}"?`,
                                        confirmText: props.contentType === 'Shorts' ? 'Delete Short' : 'Delete Video',
                                        onConfirm: async () => {
                                            try {
                                                const token = localStorage.getItem('accessToken');
                                                const response = await fetch(`${VITE_API_URL}/videos/${item.id}`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'Authorization': `Bearer ${token}`,
                                                    },
                                                });
                                                if (!response.ok) {
                                                    throw new Error('Failed to delete video');
                                                }
                                                // Refresh the page or update the state to remove the video
                                                window.location.reload();
                                            } catch (error) {
                                                console.error('Error deleting video:', error);
                                                alert(`Error al eliminar el ${props.contentType === 'Shorts' ? 'short' : 'video'}. Inténtalo de nuevo.`);
                                            }
                                        },
                                    })}
                                >
                                    <MdDelete size={25} color="#1a1a1b" />
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