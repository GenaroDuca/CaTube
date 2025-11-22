import UlContainer from "../homePageComponents/UlContainer";
import { leftMenuStudio } from "../../assets/data/Data";

import './SidebarStudio.css';

function SidebarStudio(props) {
    return (
        <div className="left-menu">
            <aside className="sidebar-left-studio">
                <header className="sidebar-left-studio-header"></header>
                <nav className="sidebar-left-studio-nav">
                    <UlContainer className="nav-list primary-nav">
                        {leftMenuStudio.map((item, index)=> (
                            <li className="nav-item" key={item.id}>
                                <button type="button" className={`nav-link ${props.activeTabIndex === index ? 'active' : ''}`} onClick={() => props.onTabClick(index)}> 
                                    <span className="nav-icon material-symbols-outlined">{item.icon}</span>
                                    <span className="nav-label">{item.text}</span>
                                </button>
                            </li>
                        ))
                        }
                    </UlContainer>
                </nav>
            </aside>
        </div>
    );
}

export default SidebarStudio;