function ContainerButton(props) {
    if (!props.tabs || props.tabs.length === 0) {
        return null;
    }
    return (
        <div className={props.containerName}>
            <ul className="content-ul">
                {props.tabs.map((label, index) => (
                    <li key={index}>
                        <button type="button" className={`${props.buttonClass} ${props.activeTabIndex === index ? 'active' : ''}`} onClick={() => props.onTabClick(index)} > {label} </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ContainerButton;