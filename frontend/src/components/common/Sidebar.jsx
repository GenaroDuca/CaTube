import { useOverlay } from '../../hooks/useOverlay.jsx';
import { leftMenu } from "../../assets/data/Data.jsx";
import { Link } from 'react-router-dom';
import './Sidebar.css';
import { useAuth } from '../../auth/AuthContext';
import { FaAngleLeft } from "react-icons/fa";

function Sidebar() {
  const {
    isOpen: isSidebarOpen,
    toggle: toggleSidebar,
    close: closeSidebar,
    overlayRef: SidebarRef
  } = useOverlay();

  const { isAuthenticated } = useAuth(); // Obtenemos el estado de autenticación

  const protectedLinks = [
    '/subscribers',
    '/you',
    '/history',
    '/view-later',
    '/liked',
    '/studio?section=content'
  ];

  return (
    <aside className={`sidebar ${isSidebarOpen ? '' : 'collapsed'}`} ref={SidebarRef}>
      <div className="sidebar-header">
        <button className="toggler sidebar-toggler" onClick={toggleSidebar}>
          <span className="material-symbols-outlined"><FaAngleLeft size={20} color="var(--container-color)" /></span>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          {leftMenu.map((props, index) => {
            if (props.divider) {
              return <hr key={`divider-${index}`} />;
            }

            const isProtected = protectedLinks.includes(props.link);
            const isDisabled = isProtected && !isAuthenticated;
            const NavComponent = isDisabled ? 'div' : Link;

            return (
              <li
                className={`nav-item ${props.isSubmenu ? 'submenu-item' : ''} ${isDisabled ? 'disabled-item' : ''}`}
                key={`nav-item-${index}`}
              >
                <NavComponent
                  to={!isDisabled ? props.link : undefined} 
                  className={`nav-link ${isDisabled ? 'disabled-link' : ''}`} 
                  onClick={isDisabled ? (e) => e.preventDefault() : undefined}
                  title={isDisabled ? "Inicia sesión para acceder" : props.text}
                  style={{ opacity: isDisabled ? 0.5 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <span className="nav-icon material-symbols-outlined">{props.icon}</span>
                  <span className="nav-label">{props.text}</span>
                </NavComponent>
                <span className="nav-tooltip">{props.text}</span>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;