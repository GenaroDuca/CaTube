import Tbody from "./Tbody";
import Thead from "./Thead";
import './VideoContent.css';


function VideoContent(props) {
    return (
        <div className="scroll-table-container">
            <table className="content-tabled">
                <Thead contentType={props.contentType}></Thead>
                <Tbody content={props.content} contentType={props.contentType}></Tbody>
            </table>
        </div>
    );
}

export default VideoContent;