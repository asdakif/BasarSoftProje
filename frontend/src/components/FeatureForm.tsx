import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Collapse } from 'react-bootstrap';
import { FeatureCreateDto } from '../types';

type DrawType = 'Point' | 'LineString' | 'Polygon';

interface FeatureFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (feature: FeatureCreateDto) => Promise<void>;
  coordinates: [number, number][] | null;
  featureType: DrawType | null;
  getWKT: (coords: [number, number][], type: DrawType) => string;
  loading: boolean;
}

const FeatureForm: React.FC<FeatureFormProps> = ({
  show,
  onHide,
  onSubmit,
  coordinates,
  featureType,
  getWKT,
  loading,
}) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [typeVal, setTypeVal] = useState('A');
  const [generalError, setGeneralError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (show) {
      setName('');
      setNameError('');
      setGeneralError('');
      setShowPreview(false);
      setTypeVal('A');
    }
  }, [show]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Konum adı zorunludur');
      return;
    } else {
      setNameError('');
    }

    if (!coordinates || !featureType) {
      setGeneralError('Koordinat seçilmedi');
      return;
    } else {
      setGeneralError('');
    }

    try {
      const wkt = getWKT(coordinates, featureType);
      const featureData: FeatureCreateDto = { name: name.trim(), wkt, type: typeVal.trim() };
      await onSubmit(featureData);
      setName('');
      setShowPreview(false);
      setGeneralError('');
      setNameError('');
    } catch (err) {
      console.error('Form submission error:', err);
      setGeneralError('Kaydetme sırasında bir hata oluştu');
    }
  };

  const handleClose = () => {
    setName('');
    setNameError('');
    setGeneralError('');
    setShowPreview(false);
    setTypeVal('A');
    onHide();
  };

  const getFeatureTypeName = (type: DrawType): string => {
    switch (type) {
      case 'Point': return 'Nokta';
      case 'LineString': return 'Çizgi';
      case 'Polygon': return 'Polygon';
      default: return 'Konum';
    }
  };

  const isSame = (a: [number, number], b: [number, number]) =>
    Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

  const getPolygonName = (pointCount: number): string => {
    switch (pointCount) {
      case 3: return 'üçgen';
      case 4: return 'dörtgen';
      case 5: return 'beşgen';
      case 6: return 'altıgen';
      case 7: return 'yedigen';
      case 8: return 'sekizgen';
      default: return `${pointCount}gen`;
    }
  };

  const formatCoordinates = (coords: [number, number][]): string => {
    if (coords.length === 1) {
      return `Boylam: ${coords[0][0].toFixed(6)}, Enlem: ${coords[0][1].toFixed(6)}`;
    }

    if (featureType === 'Polygon') {
      let pointCount = coords.length;
      if (coords.length > 2 && isSame(coords[0], coords[coords.length - 1])) {
        pointCount = coords.length - 1;
      }
      return `${pointCount} nokta seçildi (${getPolygonName(pointCount)})`;
    }

    return `${coords.length} nokta seçildi`;
  };

  const wktPreview =
    coordinates && featureType ? getWKT(coordinates, featureType) : '';

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            Yeni {featureType ? getFeatureTypeName(featureType) : 'Konum'} Ekle
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {generalError && (
            <Alert
              variant="danger"
              onClose={() => setGeneralError('')}
              dismissible
              className="mb-3"
            >
              {generalError}
            </Alert>
          )}

          <Form.Group className="mb-3" controlId="featureName">
            <Form.Label>Konum Adı *</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${featureType ? getFeatureTypeName(featureType) : 'Konum'} adını girin`}
              isInvalid={!!nameError}
              autoFocus
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {nameError}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Seçilen Koordinatlar</Form.Label>
            <div className="p-2 bg-light rounded">
              <small>
                {coordinates ? formatCoordinates(coordinates) : 'Seçilmedi'}
              </small>
            </div>
          </Form.Group>

          <Form.Group className="mb-3" controlId="featureType">
            <Form.Label>Tür</Form.Label>
            <Form.Select value={typeVal} onChange={(e) => setTypeVal(e.target.value)} disabled={loading}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </Form.Select>
          </Form.Group>

          {coordinates && featureType && (
            <>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setShowPreview((s) => !s)}
                className="mb-2"
                disabled={loading}
              >
                {showPreview ? 'WKT’yi Gizle' : 'WKT’yi Göster'}
              </Button>
              <Collapse in={showPreview}>
                <div>
                  <Form.Control as="textarea" rows={3} readOnly value={wktPreview} />
                </div>
              </Collapse>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            İptal
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !coordinates || !featureType}
          >
            {loading ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FeatureForm;
