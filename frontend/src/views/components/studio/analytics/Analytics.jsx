import VideoContent from "../content/VideoContent";
import DoughnutChart from "./Doughnut";
import LineChart from "./LineChart";
import { videosContent } from "../../../../assets/data/Data";

function Analytics() {
    return (
        <>
            <h1>Analytics (feature coming soon)</h1>
            <hr />
            <div className="content">
                <div className="graphics-container">
                    <div className="ts-chart-container ts-line-chart">
                        <LineChart></LineChart>
                    </div>

                    <div className="ts-chart-container ts-doughnut-chart">
                        <DoughnutChart></DoughnutChart>
                    </div>
                </div>
                <br></br>

                <h2>Top Videos</h2>


                <VideoContent content={videosContent} contentType="Playlists"></VideoContent>
            </div>
        </>
    );
}

export default Analytics;