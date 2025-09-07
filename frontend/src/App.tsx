import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Navbar from './components/Navbar';
import Map from './components/Map';
import FeatureList from './components/FeatureList';
import Statistics from './components/Statistics';
import { FeatureReadDto } from './types';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'ol/ol.css';

function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [selectedFeature, setSelectedFeature] = useState<FeatureReadDto | null>(null);

  const handleFeatureSelect = (feature: FeatureReadDto) => {
    setSelectedFeature(feature);
    setActiveTab('map');
  };

  const handleFeatureDeleted = () => {
    setSelectedFeature(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <Map 
            selectedFeature={selectedFeature}
            onFeatureDeleted={handleFeatureDeleted}
          />
        );
      case 'list':
        return (
          <Container fluid className="py-4">
            <Row>
              <Col lg={8} md={10} className="mx-auto">
                <FeatureList 
                  onFeatureSelect={handleFeatureSelect}
                  onFeatureDeleted={handleFeatureDeleted}
                />
              </Col>
            </Row>
          </Container>
        );
      case 'statistics':
        return (
          <Statistics 
            onFeatureSelect={handleFeatureSelect}
          />
        );
      default:
        return <Map selectedFeature={selectedFeature} onFeatureDeleted={handleFeatureDeleted} />;
    }
  };

  return (
    <div className="App">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  );
}

export default App;
