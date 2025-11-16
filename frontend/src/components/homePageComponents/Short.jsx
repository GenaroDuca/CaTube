
function Short(props) {
        // Handle photo URL properly
        let photoSrc = props.photo || '';
        if (photoSrc && !photoSrc.startsWith('http')) {
                photoSrc = `http://localhost:3000${photoSrc}`;
        }

        return (
                <div className="short-card">
                        <img className="short" src={photoSrc} alt={props.nameshort} />
                        <p className="name-channel">{props.nameshort}</p>
                        <p className="subs-channel">{props.shortviews}</p>
                </div>
        );
}
export default Short;