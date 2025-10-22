//Components
import SearchBar from "./searchBar.jsx"
import { NotificationMenu } from "../modal/headerModalsComponents/notificationsModal/NotificationMenu.jsx";
import { UserMenu } from "../../user/UserMenu.jsx";

//Icons
import { FaCirclePlus, FaMicrophone } from "react-icons/fa6";
import { ImSearch } from "react-icons/im";
//Router
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export function CatubeHeader({logo, searchQuery, setSearchQuery}) {
    const { pathname } = useLocation();
    const isRegisterPage = pathname.includes('/register');

    //Conditional classes and visibility
    const cardClassName = isRegisterPage
        ? 'sr-header-right register'
        : 'sr-header-right';

    const showSearchBar = !isRegisterPage;

    return (
        <header className="sr-header">
            <Link to={`/`}>
                <div className="sr-header-logo">
                    <img className="sr-header-symbol" src={logo} alt={`Logo de Catube`} />
                    <span className="sr-header-title">CaTube</span>
                </div>
            </Link>

            {showSearchBar && (
                <div className="sr-header-searchBar">
                    <button className="sr-header-micButton"><FaMicrophone size={20} /></button>
                    <div className="sr-header-searchBarSection">
                        <SearchBar
                            className="sr-header-input"
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                        <Link to={`/Search`}>
                            <button className="sr-header-searchButton"><ImSearch size={20} /></button>
                        </Link>
                    </div>
                </div>
            )}

            <div className={cardClassName}>
                <button className="sr-header-createButton">
                    <span className="sr-header-createLabel">Create</span>
                    <FaCirclePlus color={"#90B484"} size={28} />
                </button>
                <div className="sr-header-userActions">
                    <NotificationMenu />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
