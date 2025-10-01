import UlContainer from "../home/UlContainer";
import { leftMenuStudio } from "../../../assets/data/Data";

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
                    <ul className="nav-list secondary-nav">
                        <li className="nav-item setting-left-menu-item">
                            <button type="button" className="nav-link">
                                <span className="material-symbols-outlined">settings</span>
                                <span className="nav-label">Settings</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
}

export default SidebarStudio;