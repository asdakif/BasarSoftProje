import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Form } from 'react-bootstrap';

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, onTabChange }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#home" className="fw-bold">
         Türkiye Haritası
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center gap-3">
            <Nav.Link 
              href="#" 
              active={activeTab === 'map'} 
              onClick={() => onTabChange('map')}
            >
              Harita
            </Nav.Link>
            <Nav.Link 
              href="#" 
              active={activeTab === 'list'} 
              onClick={() => onTabChange('list')}
            >
              Konum Listesi
            </Nav.Link>
            <Nav.Link 
              href="#" 
              active={activeTab === 'statistics'} 
              onClick={() => onTabChange('statistics')}
            >
              İstatistikler
            </Nav.Link>
            <button
              aria-label="Tema Değiştir"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 20,
                cursor: 'pointer',
                lineHeight: 1,
              }}
              title={theme === 'dark' ? 'Light moda geç' : 'Dark moda geç'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;



