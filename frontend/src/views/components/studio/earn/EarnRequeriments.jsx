import Container from "../../hooks/Container";

function EarnRequeriments(props) {
    const percent = Math.min(100, (props.current / props.max) * 100);
    return (
        <>
            <h4>{props.title}</h4>
            <Container className="progress-bar-container">
                <Container className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: percent + "%" }}></div>
                </Container>
            </Container>
            <Container className="progress-bar-labels">
                <span>{props.current}</span>
                <span>Target:{props.max}</span>
            </Container>
        </>
    );
}

export default EarnRequeriments;

