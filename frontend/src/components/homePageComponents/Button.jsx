function NewButton(props){
    return(
    <button id={props.id} className={props.btnclass} onClick={props.onClick}>{props.btntitle || props.children}</button>

    );
}
export default NewButton;
