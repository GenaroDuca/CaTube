import { leftMenu } from "../../../assets/data/Data.jsx";
import { useState } from "react";
import { Link } from 'react-router-dom'

function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleTogglerClick = () => {
        setIsCollapsed(prevState => !prevState);
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <header className="sidebar-header">
                <button className="toggler sidebar-toggler" onClick={handleTogglerClick}>
                    <span className="material-symbols-outlined">
                        {'chevron_left'}
                    </span>
                </button>
            </header>
            <nav className="sidebar-nav">
                <ul className="nav-list primary-nav">
                    {leftMenu.map((props, index) =>
                        props.divider ? (
                            <hr key={`divider-${index}`} />
                        ) : (
                            <li className={`nav-item ${props.isSubmenu ? 'submenu-item' : ''}`} key={`nav-item-${index}`} >
                                <Link to={props.link} className="nav-link">
                                    <span className="nav-icon material-symbols-outlined">
                                        {props.icon}
                                    </span>
                                    <span className="nav-label">{props.text}</span>
                                </Link>
                                <span className="nav-tooltip">{props.text}</span>
                            </li>
                        )
                    )}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
