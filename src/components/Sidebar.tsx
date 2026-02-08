import React, { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 'quick-start',
      label: '快速开始',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 3h6l4 4v6H3V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M9 3v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'data-connection',
      label: '数据连接',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ),
      expanded: true,
      children: [
        { id: 'connector', label: '连接器', path: '/connectors' },
        { id: 'data-load', label: '数据载入', path: '/data-load' },
        { id: 'data-export', label: '数据导出', path: '/data-export' },
      ],
    },
    {
      id: 'data-processing',
      label: '数据处理',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="6" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M5 3v3M8 3v3M11 3v3M5 10v3M8 10v3M11 10v3"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      id: 'data-management',
      label: '数据管理',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <ellipse cx="8" cy="4" rx="5" ry="2" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M3 4v4c0 1.1 2.2 2 5 2s5-.9 5-2V4M3 8v4c0 1.1 2.2 2 5 2s5-.9 5-2V8"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ),
      expanded: true,
      children: [
        { id: 'data-center', label: '数据中心', path: '/data-center' },
        { id: 'data-exploration', label: '数据探索', path: '/data-exploration' },
      ],
    },
    {
      id: 'alert',
      label: '告警',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2l6 10H2L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8 6v4M8 12v0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'user-permission',
      label: '用户权限',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ]);

  const activeDataConnection = useMemo(() => {
    return (
      location.pathname.startsWith('/connectors') ||
      location.pathname.startsWith('/data-load') ||
      location.pathname.startsWith('/data-export')
    );
  }, [location.pathname]);

  const activeDataManagement = useMemo(() => {
    return (
      location.pathname.startsWith('/data-center') ||
      location.pathname.startsWith('/data-exploration')
    );
  }, [location.pathname]);

  const toggleMenu = (id: string) => {
    setMenuItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-main">
          {menuItems.map((item) => (
            <div key={item.id}>
              <div
                className={`menu-item ${item.children ? 'has-children' : ''} ${item.expanded ? 'expanded' : ''} ${(item.id === 'data-connection' && activeDataConnection) || (item.id === 'data-management' && activeDataManagement) ? 'active-parent' : ''}`}
                onClick={() => item.children && toggleMenu(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
                {item.children && (
                  <svg className="menu-arrow" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M4 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              {item.expanded && item.children && (
                <div className="submenu">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.id}
                      to={child.path ?? '#'}
                      className={({ isActive }) =>
                        `submenu-item ${isActive ? 'active' : ''}`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-footer">
          <div className="menu-item">
            <svg className="menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3 13c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="menu-label">yangjing</span>
          </div>
          <div className="menu-item">
            <svg className="menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="menu-label">API 管理</span>
          </div>
          <div className="menu-item">
            <svg className="menu-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            <span className="menu-label">MCP</span>
          </div>
          <button className="sidebar-collapse">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
