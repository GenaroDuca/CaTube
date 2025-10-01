
function Tbody(props) {
    return (
        <tbody>
            {props.content.map((item, idx) => (
                <tr key={idx}>
                    <td data-label="Video">
                        <div className="video-content">
                            <input type="checkbox" />
                            <a href="/watch_videos/watch_videos.html">
                                <img src={item.src} alt={item.alt}></img>
                            </a>
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
                            <button className="edit-video-btn">
                                <span className="material-symbols-outlined">
                                    edit
                                </span>
                            </button>
                        </td>
                    )}
                </tr>
            ))}
        </tbody>
    );
}

export default Tbody;