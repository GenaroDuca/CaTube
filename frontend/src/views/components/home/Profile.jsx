function Profile(props){
    return(
    <div className="profile">
    <img className="profile-photo" src={props.photo} alt={props.namechannel} />
    <p className="name-channel">{props.namechannel}</p>
    <p className="subs-channel">{props.subschannel}</p>
    </div>
    );
}
export default Profile;