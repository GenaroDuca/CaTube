function Icons(props) {
    return (
        <div className="icon" onClick={props.onClick}>
            <img src={props.src} alt={props.name} />
            <p>{props.name}</p>
        </div>
    );
}

export default Icons;