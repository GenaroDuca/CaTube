import { VITE_API_URL } from '../../../config';

function Short(props) {
        // Handle photo URL properly
        let photoSrc = props.thumbnail || '';
        if (photoSrc && !photoSrc.startsWith('http')) {
                photoSrc = `${VITE_API_URL}${photoSrc}`;
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