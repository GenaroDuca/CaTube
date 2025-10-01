import { profile } from "../../../assets/data/Data"
import { Link } from 'react-router-dom'
import NewButton from "../home/Button";

function Profile() {
    return (
    <div className="container-profile">
        <div className="first-part-profile">
            <img className="channel-photo" src={profile.src} alt={profile.name} />
            <div className="text-channel">
                <h2>{profile.name} </h2>
                <div className="row-info">
                    <p className="space">{profile.handle} </p>
                    <p className="space">{profile.subs} </p>
                    <p className="space">{profile.videos} </p>
                </div>
                <p>{profile.description} </p>
            </div>
        </div>
        <div className="row">
            <Link to="/studio/?section=customization" className="customize-btn-channel">
            <NewButton btnclass="customize-btn-channel" btntitle="Customize channel"></NewButton>
            </Link>
            <Link to="/studio/?section=content">
            <NewButton btnclass="manage-btn-videos" btntitle="Manage videos"></NewButton>
            </Link>
        </div>
    </div>
    );
}

export default Profile;