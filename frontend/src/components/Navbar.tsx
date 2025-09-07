import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';

interface NavigationBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ activeTab, onTabChange }) => {
  

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
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;



