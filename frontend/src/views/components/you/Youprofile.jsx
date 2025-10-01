import { youProfile } from "../../../assets/data/Data";

function Youprofile() {
    return (
    <div className="container-profile">
        <div className="first-part-profile">
            <img className="channel-photo" src={youProfile.src} alt={youProfile.name} />
            <div className="text-channel">
                <h2>{youProfile.name}</h2>
                <div className="row-info">
                    <p className="space">{youProfile.handle}</p>
                    <p className="space">{youProfile.subs}</p>
                    <p className="space">{youProfile.videos}</p>
                </div>
                <p>{youProfile.description}</p>
            </div>
        </div>
    </div>
    );
}

export default Youprofile;