import React from 'react';
import DiscoverHeader from './components/discover/DiscoverHeader';
import RecommendationCard from './components/discover/RecommendationCard';
import '../styles/DiscoverPage.css'
import Header from './components/header/Header';
import Sidebar from './components/hooks/Sidebar';
import Footer from './components/hooks/Footer';
import { discoverRecommendations } from '../assets/data/Data';

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