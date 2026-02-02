import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <svg className="logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="4" fill="url(#gradient)"/>
            <path d="M8 10L14 14L20 10M8 14L14 18L20 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="28" y2="28">
                <stop offset="0%" stopColor="#4A90E2"/>
                <stop offset="100%" stopColor="#357ABD"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="logo-text">
            <strong>MatrixOne</strong>
            <br/>
            <span className="logo-subtitle">Intelligence</span>
          </span>
        </div>
      </div>
      
      <div className="header-center">
        <div className="workspace-selector">
          <span className="workspace-name">GenAI 工作区</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L3 5h6L6 8z"/>
          </svg>
        </div>
        <div className="divider-dot">•</div>
        <div className="workspace-switch">
          <span>数问的工作区</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13 8H3M3 8l3-3M3 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
      </div>
      
      <div className="header-right">
        <button className="icon-btn" title="帮助">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 14V14.01M10 11V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="icon-btn" title="文档">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4h12v12H4V4z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="icon-btn" title="语言">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M3 10h14M10 3c-2 2-2 8 0 14M10 3c2 2 2 8 0 14" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <button className="icon-btn" title="时间">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="user-menu">
          <div className="avatar">杨</div>
        </div>
        
        <button className="icon-btn collapse-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 6L9 12L3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 10 10)"/>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
