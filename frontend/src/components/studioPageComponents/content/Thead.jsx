function Thead(props) {
    return (
        <thead>
            <tr>
                <th>
                    <div className="header-video">
                        <span>Video</span>
                    </div>
                </th>
                <th>Visibility</th>
                <th>Restrictions</th>
                <th>Date</th>
                <th>Views</th>
                <th>Comments</th>
                <th>Likes</th>
                {props.contentType !== 'Playlists' && (
                    <th>Edit</th>
                )}
            </tr>
        </thead>

    );
}

export default Thead;