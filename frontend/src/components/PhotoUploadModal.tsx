import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Button, Form, Alert, ProgressBar } from 'react-bootstrap';
import { featureService } from '../services/api';

interface PhotoUploadModalProps {
  show: boolean;
  onHide: () => void;
  featureId: number | null;
  onUploaded?: () => void;
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ show, onHide, featureId, onUploaded }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (show) {
      setFiles([]);
      setError(null);
      setSuccess(null);
      setUploading(false);
      setProgress(0);
    }
  }, [show]);

  const previews = useMemo(() => files.map((f) => ({
    name: f.name,
    url: URL.createObjectURL(f),
  })), [files]);

  useEffect(() => () => previews.forEach(p => URL.revokeObjectURL(p.url)), [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    const imagesOnly = selected.filter((f) => f.type.startsWith('image/'));
    if (selected.length && imagesOnly.length !== selected.length) {
      setError('Sadece resim dosyaları yükleyebilirsiniz');
    } else {
      setError(null);
    }
    setFiles(imagesOnly);
  };

  const handleUpload = async () => {
    if (!featureId) {
      setError('Geçersiz konum');
      return;
    }
    if (!files.length) {
      setError('En az bir fotoğraf seçin');
      return;
    }
    setError(null);
    setSuccess(null);
    setUploading(true);
    setProgress(0);
    try {
      const res = await featureService.uploadPhotos(featureId, files, setProgress);
      if (res.success) {
        setSuccess('Fotoğraflar yüklendi');
        onUploaded?.();
      } else {
        setError(res.message || 'Yükleme başarısız');
      }
    } catch (e) {
      setError('Yükleme sırasında bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Fotoğraf Yükle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

        <Form.Group className="mb-3" controlId="photoFiles">
          <Form.Label>Fotoğraflar</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={handleFileChange} disabled={uploading} />
          <Form.Text muted>Birden fazla görsel seçebilirsiniz</Form.Text>
        </Form.Group>

        {files.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {previews.map((p) => (
              <div key={p.url} style={{ border: '1px solid #eee', borderRadius: 6, padding: 6 }}>
                <img src={p.url} alt={p.name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
                <div style={{ marginTop: 4, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>{p.name}</div>
              </div>
            ))}
          </div>
        )}

        {uploading && (
          <div className="mt-3">
            <ProgressBar now={progress} label={`${progress}%`} animated striped />
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={uploading}>Kapat</Button>
        <Button variant="primary" onClick={handleUpload} disabled={uploading || files.length === 0 || !featureId}>
          {uploading ? 'Yükleniyor...' : 'Yükle'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhotoUploadModal;


