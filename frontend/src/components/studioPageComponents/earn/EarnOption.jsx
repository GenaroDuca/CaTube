function EarnOption(props) {
  return (
    <>
      <details className="earn-option">
        <summary>{props.title}</summary>
        {props.subtitle && <h4>{props.subtitle}</h4>}
        {props.description && <p>{props.description}</p>}
        {props.children}
      </details>
      <hr />
    </>
  );
}

export default EarnOption;