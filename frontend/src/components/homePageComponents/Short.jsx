function Short(props){
return (
        <div className="short-card">
        <img className="short" src={props.photo} alt={props.nameshort} />
        <p className="name-channel">{props.nameshort}</p>
        <p className="subs-channel">{props.shortviews}</p>
        </div>
);
}
export default Short;