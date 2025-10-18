function Icons(props) {
    return (
        <div className="icon">
            <img src={props.src} alt={props.name} />
            <p>{props.name}</p>
        </div>
    );
}

export default Icons;