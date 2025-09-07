import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import { featureService } from '../services/api';
import { FeatureReadDto } from '../types';

interface StatisticsProps {
  onFeatureSelect: (feature: FeatureReadDto) => void;
}

interface StatsData {
  totalFeatures: number;
  byType: {
    points: number;
    lines: number;
    polygons: number;
  };
  recentFeatures: FeatureReadDto[];
}

const Statistics: React.FC<StatisticsProps> = ({ onFeatureSelect }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await featureService.getAll(1, 1000);
      if (response.success && response.data) {
        const features = response.data.items || [];
        
        const byType = {
          points: features.filter(f => f.wkt.includes('POINT')).length,
          lines: features.filter(f => f.wkt.includes('LINESTRING')).length,
          polygons: features.filter(f => f.wkt.includes('POLYGON')).length
        };

        const recentFeatures = features
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);

        setStats({
          totalFeatures: features.length,
          byType,
          recentFeatures
        });
      } else {
        setError('İstatistikler yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('İstatistikler yüklenirken hata oluştu');
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };



  const getFeatureTypeText = (wkt: string) => {
    if (wkt.includes('POINT')) return 'Nokta';
    if (wkt.includes('LINESTRING')) return 'Çizgi';
    if (wkt.includes('POLYGON')) return 'Polygon';
    return 'Bilinmeyen';
  };

  const getFeatureTypeIcon = (wkt: string) => {
    if (wkt.includes('POINT')) return '📍';
    if (wkt.includes('LINESTRING')) return '➖';
    if (wkt.includes('POLYGON')) return '⬜';
    return '❓';
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: 'calc(100vh - 56px)',
        padding: '20px'
      }}>
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: 'white' }} />
          <p className="mt-3" style={{ color: 'white', fontWeight: '500' }}>
            📊 İstatistikler yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: 'calc(100vh - 56px)',
        padding: '20px'
      }}>
        <Alert 
          variant="danger" 
          style={{
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'rgba(220,53,69,0.95)',
            color: 'white',
            fontWeight: '500'
          }}
        >
          ⚠️ {error}
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: 'calc(100vh - 56px)',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ 
          color: 'white', 
          fontWeight: '700',
          textAlign: 'center',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          marginBottom: '10px'
        }}>
          📊 Detaylı İstatistikler
        </h2>
        <p style={{ 
          color: 'rgba(255,255,255,0.8)', 
          textAlign: 'center',
          fontSize: '16px'
        }}>
          Türkiye Haritası Veri Analizi
        </p>
      </div>

      <Row className="g-4">
        <Col lg={6}>
          <Card style={{
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            height: '100%'
          }}>
            <Card.Header style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px 16px 0 0',
              padding: '20px'
            }}>
              <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '1.2rem' }}>
                📈 Genel İstatistikler
              </h5>
            </Card.Header>
            <Card.Body style={{ padding: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  fontSize: '3rem',
                  fontWeight: '700',
                  color: '#667eea',
                  marginBottom: '8px'
                }}>
                  {stats.totalFeatures}
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  color: '#666',
                  fontWeight: '500'
                }}>
                  Toplam Konum
                </div>
              </div>

              <Row className="g-3">
                <Col xs={4}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '600',
                      color: '#28a745',
                      marginBottom: '4px'
                    }}>
                      {stats.byType.points}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      📍 Nokta
                    </div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '600',
                      color: '#ffc107',
                      marginBottom: '4px'
                    }}>
                      {stats.byType.lines}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      ➖ Çizgi
                    </div>
                  </div>
                </Col>
                <Col xs={4}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '600',
                      color: '#dc3545',
                      marginBottom: '4px'
                    }}>
                      {stats.byType.polygons}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      ⬜ Polygon
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card style={{
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            height: '100%'
          }}>
            <Card.Header style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px 16px 0 0',
              padding: '20px'
            }}>
              <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '1.2rem' }}>
                🕒 Son Eklenen Konumlar
              </h5>
            </Card.Header>
            <Card.Body style={{ padding: '24px' }}>
              {stats.recentFeatures.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666' }}>
                  Henüz konum eklenmemiş
                </div>
              ) : (
                <div>
                  {stats.recentFeatures.map((feature, index) => (
                    <div 
                      key={feature.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        marginBottom: '8px',
                        backgroundColor: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => onFeatureSelect(feature)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.05)';
                      }}
                    >
                      <div style={{
                        fontSize: '1.5rem',
                        marginRight: '12px'
                      }}>
                        {getFeatureTypeIcon(feature.wkt)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '2px'
                        }}>
                          {feature.name}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          {getFeatureTypeText(feature.wkt)}
                        </div>
                      </div>
                      <Badge 
                        bg="secondary"
                        style={{
                          fontSize: '0.7rem',
                          padding: '4px 8px'
                        }}
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
