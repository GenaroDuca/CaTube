import { useOverlay } from '../../hooks/useOverlay.jsx';
import { leftMenu } from "../../assets/data/Data.jsx";
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../../auth/AuthContext';

function Sidebar() {
  const {
    isOpen: isSidebarOpen,
    toggle: toggleSidebar,
    close: closeSidebar,
    overlayRef: SidebarRef
  } = useOverlay();

  const { isAuthenticated } = useAuth();

  const protectedLinks = [
    '/subscribers',
    '/you',
    '/history',
    '/view-later',
    '/liked',
    '/studio?section=content'
  ];

  const filteredMenu = leftMenu.filter(item => {
    if (item.divider) return true;
    if (protectedLinks.includes(item.link)) {
      return isAuthenticated;
    }
    return true;
  });

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`} ref={SidebarRef}>
      <div className="sidebar-header">
        <button className="toggler sidebar-toggler" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          {filteredMenu.map((props, index) =>
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