import SearchBar from "../search/SearchBar"
import { NotificationMenu } from "../notifications/NotificationMenu.jsx";
import { UserMenu } from "../user/UserMenu.jsx";
import { Link} from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMicrophone, faSearch} from '@fortawesome/free-solid-svg-icons';


export function CatubeHeader({logo, searchQuery, setSearchQuery}) {
    return (
        <header className="sr-header">
            <div className="sr-header-logo">
                <Link to="/"><img className="sr-header-symbol" src={logo} alt={`Logo de Catube`}/></Link>
                <span className="sr-header-title">CaTube</span>
            </div>
            <div className="sr-header-searchBar">
                <button className="sr-header-micButton"><FontAwesomeIcon icon={faMicrophone}/></button>
                <div className="sr-header-searchBarSection">
                    <SearchBar
                        className="sr-header-input"
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                    <button className="sr-header-searchButton"><FontAwesomeIcon icon={faSearch}/></button>
                </div>
            </div>
            <div className="sr-header-right">
                <button className="sr-header-createButton">
                    <span className="sr-header-createLabel">Create</span> 
                    <FontAwesomeIcon className="plusIcon" icon={faPlus}/>
                </button>
                <div className="sr-header-userActions">
                    <NotificationMenu />
                    <UserMenu />
                </div>
            </div>
        </header> 
    )
}