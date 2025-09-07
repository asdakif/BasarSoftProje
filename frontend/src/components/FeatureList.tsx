import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { featureService } from '../services/api';
import { FeatureReadDto } from '../types';

interface FeatureListProps {
  onFeatureSelect: (feature: FeatureReadDto) => void;
  onFeatureDeleted: () => void;
}

const FeatureList: React.FC<FeatureListProps> = ({ onFeatureSelect, onFeatureDeleted }) => {
  const [features, setFeatures] = useState<FeatureReadDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<FeatureReadDto | null>(null);
  const [sortKey, setSortKey] = useState<'name' | 'type'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [total, setTotal] = useState(0);

  const loadFeatures = async (search?: string, p: number = page, ps: number = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      const response = await featureService.getAll(p, ps, search);
      if (response.success && response.data) {
        setFeatures(response.data.items || []);
        setTotal(response.data.total || 0);
      } else {
        setError('Konumlar yüklenirken hata oluştu');
      }
    } catch (err) {
      setError('Konumlar yüklenirken hata oluştu');
      console.error('Error loading features:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures(searchTerm, page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const sortedFeatures = React.useMemo(() => {
    const copy = [...features];
    copy.sort((a, b) => {
      let va: string = '';
      let vb: string = '';
      if (sortKey === 'name') {
        va = (a.name || '').toLowerCase();
        vb = (b.name || '').toLowerCase();
      } else {
        va = getFeatureTypeText(a.wkt);
        vb = getFeatureTypeText(b.wkt);
      }
      const cmp = va.localeCompare(vb, 'tr');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [features, sortKey, sortDir]);

  const toggleSort = (key: 'name' | 'type') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadFeatures(searchTerm, 1, pageSize);
  };

  const handleDelete = async () => {
    if (!featureToDelete) return;

    try {
      setLoading(true);
      const response = await featureService.delete(featureToDelete.id);
      if (response.success) {
        setFeatures(features.filter(f => f.id !== featureToDelete.id));
        onFeatureDeleted();
        setShowDeleteModal(false);
        setFeatureToDelete(null);
      } else {
        setError('Konum silinirken hata oluştu');
      }
    } catch (err) {
      setError('Konum silinirken hata oluştu');
      console.error('Error deleting feature:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (feature: FeatureReadDto) => {
    setFeatureToDelete(feature);
    setShowDeleteModal(true);
  };

  function getFeatureTypeText(wkt: string): string {
    if (wkt.includes('POINT')) return 'Nokta';
    if (wkt.includes('LINESTRING')) return 'Çizgi';
    if (wkt.includes('POLYGON')) return 'Polygon';
    return 'Bilinmeyen';
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: 'calc(100vh - 56px)',
      padding: '20px'
    }}>
      <Card style={{
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}>
        <Card.Header style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '16px 16px 0 0',
          padding: '20px'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0" style={{ fontWeight: '600', fontSize: '1.2rem' }}>
              📋 Konum Listesi
            </h5>
            <Button 
              variant="light" 
              size="sm"
              onClick={() => loadFeatures()}
              disabled={loading}
              style={{
                borderRadius: '8px',
                fontWeight: '500',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              {loading ? <Spinner animation="border" size="sm" /> : '🔄 Yenile'}
            </Button>
          </div>
        </Card.Header>
        <Card.Body style={{ padding: '24px' }}>
          <Form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="🔍 Konum adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                  fontSize: '14px'
                }}
              />
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading}
                style={{
                  borderRadius: '8px',
                  fontWeight: '500',
                  padding: '12px 20px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {loading ? <Spinner animation="border" size="sm" /> : '🔍 Ara'}
              </Button>
            </div>
          </Form>

          {error && (
            <Alert 
              variant="danger" 
              dismissible 
              onClose={() => setError(null)}
              style={{
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'rgba(220,53,69,0.1)',
                color: '#dc3545',
                fontWeight: '500'
              }}
            >
              ⚠️ {error}
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: '#667eea' }} />
              <p className="mt-3" style={{ color: '#666', fontWeight: '500' }}>Yükleniyor...</p>
            </div>
          ) : features.length === 0 ? (
            <div className="text-center py-5">
              <p style={{ color: '#666', fontSize: '16px' }}>📭 Henüz konum bulunmuyor</p>
            </div>
          ) : (
            <div>
              <Table responsive hover style={{ marginTop: '16px' }}>
                <thead>
                  <tr style={{ background: 'rgba(102, 126, 234, 0.1)' }}>
                    <th style={{ 
                      border: 'none', 
                      padding: '16px 12px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      <button
                        onClick={() => toggleSort('name')}
                        style={{ background: 'transparent', border: 'none', padding: 0, fontWeight: 600, color: '#333', cursor: 'pointer' }}
                        title="Ada göre sırala"
                      >
                        Ad {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th style={{ 
                      border: 'none', 
                      padding: '16px 12px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      <button
                        onClick={() => toggleSort('type')}
                        style={{ background: 'transparent', border: 'none', padding: 0, fontWeight: 600, color: '#333', cursor: 'pointer' }}
                        title="Türe göre sırala"
                      >
                        Tür {sortKey === 'type' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </button>
                    </th>
                    <th style={{ 
                      border: 'none', 
                      padding: '16px 12px',
                      fontWeight: '600',
                      color: '#333'
                    }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFeatures.map((feature) => (
                    <tr key={feature.id} style={{ 
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease'
                    }}>
                      <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                        <div 
                          style={{ 
                            cursor: 'pointer',
                            fontWeight: '500',
                            color: '#333',
                            transition: 'color 0.2s ease'
                          }}
                          onClick={() => onFeatureSelect(feature)}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#667eea'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#333'}
                        >
                          📍 {feature.name}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: '#667eea',
                          color: 'white'
                        }}>
                          {getFeatureTypeText(feature.wkt)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', verticalAlign: 'middle' }}>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onFeatureSelect(feature)}
                            style={{
                              borderRadius: '8px',
                              fontWeight: '500',
                              borderColor: '#667eea',
                              color: '#667eea',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#667eea';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#667eea';
                            }}
                          >
                            👁️ Görüntüle
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => confirmDelete(feature)}
                            style={{
                              borderRadius: '8px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🗑️ Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ color: '#333', fontWeight: 500 }}>Sayfa Boyutu:</span>
                  <Form.Select size="sm" style={{ width: 100 }} value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </div>
                <div style={{ color: '#333', fontWeight: 500 }}>
                  Toplam: {total} • Sayfa: {page} / {Math.max(1, Math.ceil(total / pageSize))}
                </div>
                <div className="d-flex gap-2">
                  <Button variant="outline-secondary" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    ← Önceki
                  </Button>
                  <Button variant="outline-secondary" size="sm" disabled={page >= Math.ceil(total / pageSize) || loading} onClick={() => setPage((p) => p + 1)}>
                    Sonraki →
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Konum Sil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>"{featureToDelete?.name}"</strong> adlı konumu silmek istediğinizden emin misiniz?
          </p>
          <p className="text-muted">Bu işlem geri alınamaz.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            İptal
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Sil'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FeatureList;
