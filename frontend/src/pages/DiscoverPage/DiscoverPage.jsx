import React from 'react';
import DiscoverHeader from '../../components/discoverPageComponents/DiscoverHeader';
import RecommendationCard from '../../components/discoverPageComponents/RecommendationCard';
import './DiscoverPage.css';
import Header from '../../components/common/header/Header';
import Sidebar from '../../components/common/Sidebar';
import Footer from '../../components/common/Footer';
import { discoverRecommendations } from '../../assets/data/Data';

function DiscoverPage() {
    return (
        <>
            <Header></Header>
            <Sidebar></Sidebar>
            <main className="main-content">

                <DiscoverHeader />

                {discoverRecommendations.map((rec, index) => (
                    <RecommendationCard key={index} data={rec} />
                ))}
                <Footer footer="footer"></Footer>
            </main>
            </>
    );
}

export default DiscoverPage;