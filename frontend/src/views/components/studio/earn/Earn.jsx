import EarnOption from "./EarnOption";
import Container from "../../hooks/Container";
import NewButton from "../../home/Button";
import Title from "../../trending/Title"
import EarnRequeriments from "./EarnRequeriments";
import { useState } from "react";

function Earn() {
    const [stats] = useState({
        subscribers: { current: 250, max: 500 },
        videos: { current: 2, max: 3 },
        hours: { current: 1000, max: 3000 }
    });

    const eligible = stats.subscribers.current >= stats.subscribers.max && stats.videos.current >= stats.videos.max && stats.hours.current >= stats.hours.max;

    return (
        <>
            <Title title="Earn CaTube"></Title>
            <hr></hr>
            <Container className="content">
                <Container className="earn-options">
                    <EarnOption
                        title="Membership"
                        subtitle="Grow your community and earn money monthly"
                        description="Offer exclusive benefits for paid members that will excite your audience. Users can join from your video and channel pages. You'll receive 70% of the net revenue."
                    />

                    <EarnOption
                        title="Donations"
                        description="Donations help you engage with your community and feel supported."
                    />

                    <EarnOption
                        title="Store"
                        subtitle="You can have your own integrated store in Catube."
                    >
                        <NewButton type="button" id="storeButton" btntitle=" Your Store"></NewButton>
                    </EarnOption>
                </Container>
                <Container className="earn-requirements">
                    <h3>Requirements to Monetize</h3>
                    <EarnRequeriments title="Subscribers" current={stats.subscribers.current} max={stats.subscribers.max}></EarnRequeriments>
                    <EarnRequeriments title="Videos Uploaded" current={stats.videos.current} max={stats.videos.max}></EarnRequeriments>
                    <EarnRequeriments title="Valid Public Watch Hours" current={stats.hours.current} max={stats.hours.max}></EarnRequeriments>
                    <Container className="apply-btn-container">
                        {eligible && (
                            <NewButton type="button" className="applyButton" btntitle="Apply" />
                        )}
                    </Container>
                </Container>
            </Container>
        </>
    );
}

export default Earn;