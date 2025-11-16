import { useOverlay } from '../../hooks/useOverlay.jsx';
import { leftMenu } from "../../assets/data/Data.jsx";
import { Link } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const {
    isOpen: isSidebarOpen,
    toggle: toggleSidebar,
    close: closeSidebar,
    overlayRef: SidebarRef
  } = useOverlay();

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`} ref={SidebarRef}>
      <header className="sidebar-header">
        <button className="toggler sidebar-toggler" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      </header>

      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          {leftMenu.map((props, index) =>
            props.divider ? (
              <hr key={`divider-${index}`} />
            ) : (
              <li className={`nav-item ${props.isSubmenu ? 'submenu-item' : ''}`} key={`nav-item-${index}`}>
                <Link to={props.link} className="nav-link">
                  <span className="nav-icon material-symbols-outlined">{props.icon}</span>
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