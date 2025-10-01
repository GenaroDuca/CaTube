
import UlContainer from "../../home/UlContainer";
import NewButton from "../../home/Button";


function FilterBar(props) {
    return (
        <div className="filter-bar">
            <UlContainer className="content-ul">
                <li><NewButton btntitle="Videos" type="button" btnclass={`content-li-btn ${props.activeFilter === 'Videos' ? 'active' : ''}`} onClick={() => props.onFilterChange('Videos')}></NewButton></li>
                <li><NewButton btntitle="Shorts" type="button" btnclass={`content-li-btn ${props.activeFilter === 'Shorts' ? 'active' : ''}`}  onClick={() => props.onFilterChange('Shorts')}></NewButton></li>
                <li><NewButton btntitle="Playlists" type="button" btnclass={`content-li-btn ${props.activeFilter === 'Playlists' ? 'active' : ''}`}  onClick={() => props.onFilterChange('Playlists')}></NewButton></li>
            </UlContainer>
            <div className="filter-container">
                <div className="filter-icon"><i className="fa-solid fa-filter"></i></div>
                <div className="filter-input">
                    <input type="text" className="text-input" role="textbox" placeholder="Filter"/>
                </div>
            </div>
        </div>

    );
}

export default FilterBar;