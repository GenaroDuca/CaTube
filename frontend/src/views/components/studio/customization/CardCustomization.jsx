function CardCustomization(props){
    return(
        <div className="card-customization">
                        <span>{props.title}</span>
                        <div>
                            <img className={props.imageClass} src={props.src}
                                alt={props.alt}></img>
                        </div>
                        <label htmlFor={props.for} className="custom-file-label">
                            <span>Upload</span>
                            <input id={props.for} type="file" accept="image/*" style={{ display: "none" }}></input>
                        </label>
        </div>
    );
}

export default CardCustomization