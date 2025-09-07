import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface PhotoGalleryModalProps {
  show: boolean;
  onHide: () => void;
  title?: string;
  photos: string[];
}

const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({ show, onHide, title = 'Foto Galerisi', photos }) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const hasPrev = previewIndex !== null && previewIndex > 0;
  const hasNext = previewIndex !== null && previewIndex < (photos?.length || 0) - 1;

  const closePreview = () => setPreviewIndex(null);
  const showPrev = () => setPreviewIndex((idx) => (idx !== null && idx > 0 ? idx - 1 : idx));
  const showNext = () => setPreviewIndex((idx) => (idx !== null && photos && idx < photos.length - 1 ? idx + 1 : idx));

  return (
    <>
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
              <div key={idx} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #eee', cursor: 'zoom-in' }} onClick={() => setPreviewIndex(idx)}>
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
    {/* Fullscreen preview modal */}
    <Modal key="preview" show={previewIndex !== null} onHide={closePreview} size="xl" centered>
      <Modal.Body style={{ backgroundColor: '#000', padding: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {previewIndex !== null && photos && (
          <img
            src={photos[previewIndex]}
            alt={`foto-large-${previewIndex}`}
            style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
          />
        )}
        {hasPrev && (
          <Button variant="light" onClick={showPrev} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.9 }}>
            ‹
          </Button>
        )}
        {hasNext && (
          <Button variant="light" onClick={showNext} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.9 }}>
            ›
          </Button>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closePreview}>Kapat</Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default PhotoGalleryModal;


