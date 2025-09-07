import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface PhotoGalleryModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  photos: string[];
}

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ show, onHide, title = 'Foto Galerisi', photos }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {(!photos || photos.length === 0) && (
          <div style={{ textAlign: 'center', color: '#666' }}>Fotoğraf yok</div>
        )}
        {photos && photos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {photos.map((url, idx) => (
              <div key={idx} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #eee' }}>
                <img
                  src={url}
                  alt={`foto-${idx}`}
                  style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Kapat</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhotoGalleryModal;


