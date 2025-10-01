import React, { useState, useMemo } from 'react'

//Components
import { ChannelList } from '../user/ChannelList.jsx'
import { VideoList } from '../video/VideoList.jsx'
import { ShortList } from '../short/ShortList.jsx'
import Header from '../header/Header.jsx'

//Styles
import './Search.css';

//Assets
import Angel from '../../assets/images/profile/angel.jpg'
import Yukki from '../../assets/images/profile/yukki.jpg'
import Gena from '../../assets/images/profile/gena.jpg'
import Jere from '../../assets/images/profile/jere.jpg'
import thumbnail from '../../assets/images/thumbnail/Pinterest Swap Challenge.jpg'
import shortThumbnail from '../../assets/images/thumbnail/Shorts.jpg'
import shortCats from '../../assets/images/thumbnail/catsShort.jpg'

export function Search() {
    const [searchQuery, setSearchQuery] = useState('');


    //esto se reemplaza
    const channels = useMemo(
        () => [
            { id: 1, avatar: Angel, userName: "Colithoxz", subscriptions: "3.4M subs" },
            { id: 2, avatar: Gena, userName: "Sheni", subscriptions: "4K subs" },
            { id: 3, avatar: Jere, userName: "Gazzard", subscriptions: "3.4K subs" },
            { id: 4, avatar: Yukki, userName: "yukki", subscriptions: "2 subs" },
            { id: 5, avatar: Angel, userName: "Colithoxz", subscriptions: "3.4M subs" },
            { id: 6, avatar: Gena, userName: "Sheni", subscriptions: "4K subs" },
            { id: 7, avatar: Jere, userName: "Gazzard", subscriptions: "3.4K subs" },
            { id: 8, avatar: Yukki, userName: "yukki", subscriptions: "2 subs" },
            { id: 9, avatar: Jere, userName: "Gazzard", subscriptions: "3.4K subs" }
        ],
        []
    );

    const videos = useMemo(
        () => [
            { id: 1, thumbnail, avatar: Yukki, title: 'Pinterest Swap Challenge', userName: "Yukki", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 2, thumbnail, avatar: Gena, title: 'title 2', userName: "Sheni", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 3, thumbnail, avatar: Jere, title: 'title 3', userName: "Gazzard", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 4, thumbnail, avatar: Yukki, title: 'Pinterest Swap Challenge', userName: "Yukki", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 5, thumbnail, avatar: Gena, title: 'title 2', userName: "Sheni", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 6, thumbnail, avatar: Jere, title: '¿Qué pasa si mezclás esto?', userName: "Gazzard", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 7, thumbnail, avatar: Yukki, title: 'Mini vlog: 1 día en Buenos Aires', userName: "Yukki", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 8, thumbnail, avatar: Gena, title: 'Cómo se ve el código detrás', userName: "Sheni", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
            { id: 9, thumbnail, avatar: Jere, title: 'Este sonido me persigue', userName: "Gazzard", description: "esto es una descripcion de prueba. repito esto es una descripcion de prueba" },
        ],
        []
    );

    const shorts = useMemo(
        () => [
            { id: 1, thumbnail: shortCats, avatar: Yukki, title: '¿Sabías esto sobre los gatos?', userName: "Yukki" },
            { id: 2, thumbnail: shortThumbnail, avatar: Gena, title: '1 truco para editar más rápido', userName: "Sheni" },
            { id: 3, thumbnail: shortThumbnail, avatar: Jere, title: 'Mi reacción al nuevo trailer', userName: "Gazzard" },
            { id: 4, thumbnail: shortThumbnail, avatar: Yukki, title: 'Lo que nadie te cuenta del café', userName: "Yukki" },
            { id: 5, thumbnail: shortThumbnail, avatar: Gena, title: 'Top 3 apps que uso diario', userName: "Sheni" },
            { id: 6, thumbnail: shortThumbnail, avatar: Jere, title: '¿Qué pasa si mezclás esto?', userName: "Gazzard" },
            { id: 7, thumbnail: shortThumbnail, avatar: Yukki, title: 'Mini vlog: 1 día en Buenos Aires', userName: "Yukki" },
            { id: 8, thumbnail: shortThumbnail, avatar: Gena, title: 'Cómo se ve el código detrás', userName: "Sheni" },
            { id: 9, thumbnail: shortThumbnail, avatar: Jere, title: 'Este sonido me persigue', userName: "Gazzard" },
        ],
        []
    );

    //filtros
    const filteredChannels = channels.filter((ch) => ch.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredVideos = videos.filter((vd) =>
        vd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vd.userName.toLowerCase().includes((searchQuery.toLowerCase()))
    );

    const filteredShorts = shorts.filter((short) =>
        short.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        short.userName.toLowerCase().includes((searchQuery.toLowerCase()))
    );


    return (
        <div className="search-page">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <main className="main-content">
                <section className="channel-section">
                    <ChannelList channels={filteredChannels} />
                </section>
                <section className="video-section">
                    <VideoList videos={filteredVideos} />
                </section>
                <section className='short-section'>
                    <ShortList shorts={filteredShorts} />
                </section>
            </main>
        </div>
    );
}

export default Search