//Components
import SearchBar from "./searchBar.jsx"
import { NotificationMenu } from "../modal/headerModalsComponents/notificationsModal/NotificationMenu.jsx";
import { UserMenu } from "../../user/UserMenu.jsx";
import { useModal } from "../../common/modal/ModalContext"

//Icons
import { FaCirclePlus, FaMicrophone } from "react-icons/fa6";
import { ImSearch } from "react-icons/im";

import { Link } from 'react-router-dom';

export function CatubeHeader({ logo, searchQuery, setSearchQuery }) {
    const { openModal } = useModal();

    return (
        <header className="sr-header">
            <div className="sr-header-logo">
                <img className="sr-header-symbol" src={logo} alt={`Logo de Catube`} />
                <span className="sr-header-title">CaTube</span>
            </div>
            <div className="sr-header-searchBar">
                <button className="sr-header-micButton"><FaMicrophone size={20} /></button>
                <div className="sr-header-searchBarSection">
                    <SearchBar
                        className="sr-header-input"
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                    <Link to={`/`}>
                        <button className="sr-header-searchButton"><ImSearch size={20} /></button>
                    </Link>
                </div>
            </div>
            <div className="sr-header-right">
                <button className="sr-header-createButton" onClick={() => openModal('createvideo')}>
                    <span className="sr-header-createLabel">Create</span>
                    <FaCirclePlus color={"#90B484"} size={28} />

                </button>
                <div className="sr-header-userActions">
                    <NotificationMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}