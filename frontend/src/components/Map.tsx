import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { Point, LineString, Polygon } from 'ol/geom';
import LinearRing from 'ol/geom/LinearRing';
import MultiPoint from 'ol/geom/MultiPoint';
import MultiLineString from 'ol/geom/MultiLineString';
import MultiPolygon from 'ol/geom/MultiPolygon';
import GeometryCollection from 'ol/geom/GeometryCollection';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { Draw } from 'ol/interaction';
import Modify from 'ol/interaction/Modify';
import Translate from 'ol/interaction/Translate';
import Collection from 'ol/Collection';
import Overlay from 'ol/Overlay';
import { WKT } from 'ol/format';
import { featureService, BACKEND_ORIGIN } from '../services/api';
import { FeatureCreateDto, FeatureReadDto } from '../types';
import FeatureForm from './FeatureForm';
import { Button, Alert, ButtonGroup, Toast, ToastContainer } from 'react-bootstrap';
import PhotoUploadModal from './PhotoUploadModal';
import PhotoGalleryModal from './PhotoGalleryModal';
import DragBox from 'ol/interaction/DragBox';
import OLFeature from 'ol/Feature';

type DrawType = 'Point' | 'LineString' | 'Polygon';

interface MapComponentProps {
  selectedFeature?: FeatureReadDto | null;
  onFeatureDeleted?: () => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ selectedFeature }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const drawInteractionRef = useRef<Draw | null>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const popupContentRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const modifyInteractionRef = useRef<Modify | null>(null);
  const translateInteractionRef = useRef<Translate | null>(null);
  const lastClickedFeatureRef = useRef<OLFeature | null>(null);
  const originalGeometryRef = useRef<any>(null);
  const jstsParserRef = useRef<any>(null);
  const lastErrorMsgRef = useRef<string | null>(null);
  const lastErrorAtRef = useRef<number>(0);

  const showErrorOnce = (msg: string) => {
    const now = Date.now();
    if (lastErrorMsgRef.current === msg && now - lastErrorAtRef.current < 1200) return;
    lastErrorMsgRef.current = msg;
    lastErrorAtRef.current = now;
    setToastVariant('danger');
    setToastMessage(msg);
    setToastShow(true);
  };

  const dragBoxRef = useRef<DragBox | null>(null);

  const [drawingMode, setDrawingMode] = useState<DrawType | null>(null);
  const [newFeatureCoords, setNewFeatureCoords] = useState<[number, number][] | null>(null);
  const [newFeatureType, setNewFeatureType] = useState<DrawType | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastShow, setToastShow] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger' | 'warning' | 'info'>('success');
  const [isEditing, setIsEditing] = useState(false);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [clickedFeatureId, setClickedFeatureId] = useState<number | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState<string>('Foto Galerisi');

  const [areaSelectMode, setAreaSelectMode] = useState(false);
  const [areaStats, setAreaStats] = useState<null | { points: number; lines: number; polys: number; total: number }>(null);
  const [areaSelectedFeatures, setAreaSelectedFeatures] = useState<OLFeature[]>([]);
  const [showAreaList, setShowAreaList] = useState(false);

  const turkeyCenter = fromLonLat([35.243322, 38.963745]);

  const removeEphemeralFeatures = () => {
    const src = vectorSourceRef.current;
    if (!src) return;
    (src.getFeatures() || [])
      .filter(f => {
        const fd = f.get('featureData');
        const hasId = fd && typeof fd.id === 'number';
        return !hasId;
      })
      .forEach(f => src.removeFeature(f));
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: createFeatureStyle,
    });

    vectorSourceRef.current = vectorSource;
    vectorLayerRef.current = vectorLayer;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer,
      ],
      view: new View({
        center: turkeyCenter,
        zoom: 6,
        maxZoom: 18,
        minZoom: 4,
        projection: 'EPSG:3857',
      }),
    });

    if (popupContainerRef.current) {
      const overlay = new Overlay({
        element: popupContainerRef.current,
        autoPan: { animation: { duration: 250 } },
        positioning: 'bottom-center',
        offset: [0, -12],
        stopEvent: true,
      });
      map.addOverlay(overlay);
      overlayRef.current = overlay;
    }

    map.on('singleclick', (evt) => {
      if (drawingMode) {
        overlayRef.current?.setPosition(undefined);
        return;
      }
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f as OLFeature);
      if (!feature) {
        overlayRef.current?.setPosition(undefined);
        
        return;
      }
      const geom = feature.getGeometry();
      if (!geom) return;

      const view = map.getView();
      const extent = geom.getExtent();

      if (geom instanceof Point) {
        const coord = geom.getCoordinates();
        view.animate({ center: coord, zoom: Math.max(view.getZoom() ?? 6, 14), duration: 300 });
        overlayRef.current?.setPosition(coord);
      } else {
        view.fit(extent, { padding: [60, 60, 60, 60], duration: 300, maxZoom: 17 });
        overlayRef.current?.setPosition(evt.coordinate);
      }

      const properties = feature.getProperties();
      if (feature.get('isSelected')) {
        const fidSel = properties.featureData?.id as number | undefined;
        const base = vectorSourceRef.current?.getFeatures().find(f => {
          const fd = f.get('featureData');
          return fd && fd.id === fidSel && !f.get('isSelected');
        }) as any;
        lastClickedFeatureRef.current = base || feature;
      } else {
        lastClickedFeatureRef.current = feature;
      }
      const fid = properties.featureData?.id as number | undefined;
      setClickedFeatureId(fid ?? null);
      const photos: string[] | undefined = properties.featureData?.photos;
      const typeVal: string | undefined = properties.featureData?.type;
      let photosHtml = '';
      const name = properties.name || properties.featureData?.name || 'İsimsiz Özellik';
      const type = geom.getType();
      
      if (popupContentRef.current) {
        const galleryBtn = photos && photos.length > 0
          ? `<button id="open-gallery-btn" style="margin-top:8px;padding:6px 10px;border-radius:6px;border:none;background:#3498db;color:#fff;font-weight:600;cursor:pointer;">Foto Galerisi</button>`
          : '';
        popupContentRef.current.innerHTML = `
          <div><b>${name}</b></div>
          <div><small>Geometri: ${type}</small></div>
          ${typeVal ? `<div><small>Tip: ${typeVal}</small></div>` : ''}
          ${galleryBtn}
        `;
        if (galleryBtn) {
          const btn = popupContentRef.current.querySelector('#open-gallery-btn') as HTMLButtonElement | null;
          if (btn) {
            btn.onclick = () => {
              const normalized = (photos || []).map((url) => {
                if (url.startsWith('http')) return url;
                let path = url;
                if (!path.startsWith('/')) path = `/photos/${path}`; else if (!path.startsWith('/photos/')) path = `/photos${path}`;
                return `${BACKEND_ORIGIN}${path}`;
              });
              setGalleryPhotos(normalized);
              setGalleryTitle(name || 'Foto Galerisi');
              setGalleryOpen(true);
            };
          }
        }
      }
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(undefined);
      }
    };
  }, []);

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const response = await featureService.getAll();
        if (response.success && response.data && response.data.items && vectorSourceRef.current) {
          const wktFormat = new WKT();
          response.data.items.forEach((featureData: any) => {
            try {
              const feature = wktFormat.readFeature(featureData.wkt);
              const geometry = feature.getGeometry();
              if (geometry) {
                geometry.transform('EPSG:4326', 'EPSG:3857');
              }
              feature.set('name', featureData.name);
              feature.set('featureData', featureData);
              vectorSourceRef.current!.addFeature(feature);
            } catch (error) {
              console.error('Error parsing feature:', featureData, error);
            }
          });
        }
      } catch (error) {
        console.error('Error loading features:', error);
      }
    };

    if (mapInstanceRef.current) {
      loadFeatures();
    }
  }, []);

  useEffect(() => {
    if (selectedFeature && mapInstanceRef.current && vectorSourceRef.current) {
      const features = vectorSourceRef.current.getFeatures();
      features.forEach(feature => {
        if (feature.get('isSelected')) {
          vectorSourceRef.current!.removeFeature(feature);
        }
      });

      const wktFormat = new WKT();
      const feature = wktFormat.readFeature(selectedFeature.wkt);
      const featureGeometry = feature.getGeometry();
      if (featureGeometry) {
        featureGeometry.transform('EPSG:4326', 'EPSG:3857');
      }
      feature.set('name', selectedFeature.name);
      feature.set('featureData', selectedFeature);
      feature.set('isSelected', true);
      vectorSourceRef.current!.addFeature(feature);

      const geometry = feature.getGeometry();
      if (geometry) {
        const view = mapInstanceRef.current.getView();
        const extent = geometry.getExtent();
        view.fit(extent, { padding: [60, 60, 60, 60], duration: 300, maxZoom: 17 });
      }
    }
  }, [selectedFeature]);

  const createFeatureStyle = (feature?: any) => {
    if (feature && feature.get('isSelected')) {
      return new Style({
        image: new Circle({
          radius: 10,
          fill: new Fill({ color: '#f39c12' }),
          stroke: new Stroke({ color: '#e67e22', width: 3 }),
        }),
        stroke: new Stroke({ color: '#f39c12', width: 4 }),
        fill: new Fill({ color: 'rgba(243, 156, 18, 0.4)' }),
      });
    }

    return new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({ color: '#3498db' }),
        stroke: new Stroke({ color: '#2980b9', width: 2 }),
      }),
      stroke: new Stroke({ color: '#3498db', width: 3 }),
      fill: new Fill({ color: 'rgba(52, 152, 219, 0.3)' }),
    });
  };

  const startEdit = () => {
    if (!mapInstanceRef.current || !lastClickedFeatureRef.current) return;
    if (drawingMode) stopDrawing();
    if (areaSelectMode) toggleAreaSelectMode();

    const feats = vectorSourceRef.current?.getFeatures() || [];
    feats
      .filter(f => f.get('isSelected'))
      .forEach(f => vectorSourceRef.current?.removeFeature(f));

    const target = lastClickedFeatureRef.current;
    const targetId = target.get('featureData')?.id;
    if (targetId && vectorSourceRef.current) {
      (vectorSourceRef.current.getFeatures() || [])
        .filter(f => f !== target && (f.get('featureData')?.id === targetId))
        .forEach(f => vectorSourceRef.current?.removeFeature(f));
    }

    const features = new Collection<OLFeature>([target]);
    const targetGeomType = target.getGeometry()?.getType();
    const isLineString = targetGeomType === 'LineString';

    const modify = new Modify({
      features,
      insertVertexCondition: isLineString ? () => false : undefined,
      deleteCondition: isLineString ? () => false : undefined,
    });
    const translate = new Translate({ features });
    mapInstanceRef.current.addInteraction(modify);
    mapInstanceRef.current.addInteraction(translate);
    modifyInteractionRef.current = modify;
    translateInteractionRef.current = translate;
    originalGeometryRef.current = target.getGeometry()?.clone() || null;
    setIsEditing(true);
  };

  const stopEdit = () => {
    if (!mapInstanceRef.current) return;
    if (modifyInteractionRef.current) {
      mapInstanceRef.current.removeInteraction(modifyInteractionRef.current);
      modifyInteractionRef.current = null;
    }
    if (translateInteractionRef.current) {
      mapInstanceRef.current.removeInteraction(translateInteractionRef.current);
      translateInteractionRef.current = null;
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    const target = lastClickedFeatureRef.current;
    if (target && originalGeometryRef.current) {
      target.setGeometry(originalGeometryRef.current);
    }
    stopEdit();
    setToastVariant('info');
    setToastMessage('Düzenleme iptal edildi');
    setToastShow(true);
    if (vectorSourceRef.current && target) {
      const id = target.get('featureData')?.id;
      if (id) {
        (vectorSourceRef.current.getFeatures() || [])
          .filter(f => f !== target && (f.get('featureData')?.id === id || f.get('isSelected')))
          .forEach(f => vectorSourceRef.current?.removeFeature(f));
      }
    }
  };

  const saveEdit = async () => {
    const target = lastClickedFeatureRef.current;
    if (!target) return;
    const geom = target.getGeometry();
    if (!geom) return;
    try {
      setLoading(true);
      const writeFmt = new WKT();
      const geom4326 = geom.clone();
      (geom4326 as any).transform('EPSG:3857', 'EPSG:4326');
      const wkt = writeFmt.writeGeometry(geom4326 as any);
      const fd = target.get('featureData') || {};
      const id = fd.id as number;
      const name = fd.name as string;
      const type = fd.type as string | undefined;
      const resp = await featureService.update(id, { name, wkt, type });
      if (resp.success && resp.data) {
        target.set('featureData', resp.data);
        setToastVariant('success');
        setToastMessage('Geometri güncellendi');
        setToastShow(true);
        stopEdit();
        if (vectorSourceRef.current) {
          const id = resp.data.id;
          (vectorSourceRef.current.getFeatures() || [])
            .filter(f => f.get('featureData')?.id === id && f !== target)
            .forEach(f => vectorSourceRef.current?.removeFeature(f));
        }
      } else {
        const msg = (resp as any)?.message?.toString() || 'Güncelleme başarısız oldu';
        showErrorOnce(msg.includes('B tipindeki çizgi') ? 'B tipindeki çizgi ile kesişti. Lütfen farklı bir konuma taşıyın.' : msg);
        if (originalGeometryRef.current) target.setGeometry(originalGeometryRef.current);
        stopEdit();
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message?.toString() || 'Güncelleme başarısız oldu';
      showErrorOnce(msg.includes('B tipindeki çizgi') ? 'B tipindeki çizgi ile kesişti. Lütfen farklı bir konuma taşıyın.' : msg);
      if (originalGeometryRef.current && lastClickedFeatureRef.current) {
        lastClickedFeatureRef.current.setGeometry(originalGeometryRef.current);
      }
      stopEdit();
    } finally {
      setLoading(false);
    }
  };

  const deleteSelected = async () => {
    const target = lastClickedFeatureRef.current;
    if (!target) return;
    try {
      setLoading(true);
      const fd = target.get('featureData') || {};
      const id = fd.id as number | undefined;
      if (id) {
        const resp = await featureService.delete(id);
        if (!resp.success) throw new Error((resp as any)?.message || 'Silme başarısız');
      }
      vectorSourceRef.current?.removeFeature(target);
      const copies = (vectorSourceRef.current?.getFeatures() || []).filter(f => {
        const cfd = f.get('featureData');
        return cfd && id && cfd.id === id;
      });
      copies.forEach(f => vectorSourceRef.current?.removeFeature(f));
      setClickedFeatureId(null);
      lastClickedFeatureRef.current = null;
      setToastVariant('success');
      setToastMessage('Öğe silindi');
      setToastShow(true);
      stopEdit();
    } catch (err: any) {
      const msg = err?.response?.data?.message?.toString() || err?.message || 'Silme başarısız';
      setToastVariant('danger');
      setToastMessage(msg);
      setToastShow(true);
    } finally {
      setLoading(false);
    }
  };

  const startDrawing = (type: DrawType) => {
    if (!mapInstanceRef.current) return;
    if (drawInteractionRef.current) {
      mapInstanceRef.current.removeInteraction(drawInteractionRef.current);
    }
    const drawInteraction = new Draw({
      source: vectorSourceRef.current!,
      type: type as 'Point' | 'LineString' | 'Polygon',
    });

    drawInteraction.on('drawend', (event) => {
      const drawnFeature = event.feature as OLFeature;
      const geometry = drawnFeature.getGeometry();

      let coordinates: [number, number][] = [];

      if (geometry instanceof Point) {
        const coords = geometry.getCoordinates();
        const lonLat = transform(coords, 'EPSG:3857', 'EPSG:4326') as [number, number];
        coordinates = [lonLat];
      } else if (geometry instanceof LineString) {
        const coords = geometry.getCoordinates();
        coordinates = coords.map(coord => transform(coord, 'EPSG:3857', 'EPSG:4326') as [number, number]);
      } else if (geometry instanceof Polygon) {
        const coords = geometry.getCoordinates()[0];
        coordinates = coords.map(coord => transform(coord, 'EPSG:3857', 'EPSG:4326') as [number, number]);
      }

      setNewFeatureCoords(coordinates);
      setNewFeatureType(type);
      setShowForm(true);
      overlayRef.current?.setPosition(undefined);
      stopDrawing();
    });

    mapInstanceRef.current.addInteraction(drawInteraction);
    drawInteractionRef.current = drawInteraction;
    setDrawingMode(type);
  };

  const stopDrawing = () => {
    if (mapInstanceRef.current && drawInteractionRef.current) {
      mapInstanceRef.current.removeInteraction(drawInteractionRef.current);
      drawInteractionRef.current = null;
    }
    setDrawingMode(null);
  };

  const toggleAreaSelectMode = () => {
    if (!mapInstanceRef.current) return;

    if (areaSelectMode) {
      if (dragBoxRef.current) {
        mapInstanceRef.current.removeInteraction(dragBoxRef.current);
        dragBoxRef.current = null;
      }
      setAreaSelectMode(false);
      setAreaStats(null);
      setAreaSelectedFeatures([]);
      setShowAreaList(false);
    } else {
      if (drawingMode) stopDrawing();

      const dragBox = new DragBox({
        condition: () => true,
      });

      dragBox.on('boxend', () => {
        const boxGeom = dragBox.getGeometry();
        const extent = boxGeom.getExtent();

        let points = 0, lines = 0, polys = 0;
        const found: OLFeature[] = [];

        const seenFeatures = new Set();
        
        vectorSourceRef.current?.forEachFeatureIntersectingExtent(extent, (feature) => {
          const g = feature.getGeometry();
          if (!g) return;

          const featureId = feature.get('featureData')?.id || feature.get('name') || `feature_${Math.random()}`;
          if (seenFeatures.has(featureId)) return;
          seenFeatures.add(featureId);

          found.push(feature);

          const type = g.getType();
          if (type === 'Point') points++;
          else if (type === 'LineString') lines++;
          else if (type === 'Polygon') polys++;
        });

        setAreaSelectedFeatures(found);
        setAreaStats({ points, lines, polys, total: points + lines + polys });
      });

      mapInstanceRef.current.addInteraction(dragBox);
      dragBoxRef.current = dragBox;
      setAreaSelectMode(true);
    }
  };

  const handleCreateFeature = async (featureData: FeatureCreateDto) => {
    try {
      setLoading(true);
      setError(null);

      const response = await featureService.create(featureData);

      if (response.success && response.data) {
        const wktFormat = new WKT();
        const feature = wktFormat.readFeature(response.data.wkt);
        const geometry = feature.getGeometry();
        if (geometry) {
          geometry.transform('EPSG:4326', 'EPSG:3857');
        }
        const featureName = response.data.name || featureData.name;
        feature.set('name', featureName);
        feature.set('featureData', response.data);
        vectorSourceRef.current?.addFeature(feature);

        const gType = geometry?.getType();
        const tr = gType === 'Point' ? 'Nokta' : gType === 'LineString' ? 'Çizgi' : 'Polygon';
        setToastMessage(`${tr} eklendi`);
        setToastVariant('success');
        setToastShow(true);

        setShowForm(false);
        setNewFeatureCoords(null);
        setNewFeatureType(null);
        removeEphemeralFeatures();
      } else {
        const apiMsg = (response as any)?.message as string | undefined;
        let msg = apiMsg && apiMsg.trim().length > 0 ? apiMsg : 'İşlem başarısız oldu';
        if (msg.includes('B tipindeki çizgi ile kesiştiği için')) {
          msg = 'B tipindeki çizgi ile kesişti. Lütfen farklı bir konuma ekleyin.';
        }
        setError(msg);
        setToastVariant('danger');
        setToastMessage(msg);
        setToastShow(true);
        setShowForm(false);
        setNewFeatureCoords(null);
        setNewFeatureType(null);
        overlayRef.current?.setPosition(undefined);
        removeEphemeralFeatures();
      }
    } catch (err: any) {
      const apiMsg: string | undefined = err?.response?.data?.message;
      let msg = apiMsg && apiMsg.trim().length > 0 ? apiMsg : 'İşlem başarısız oldu';
      if (msg.includes('B tipindeki çizgi ile kesiştiği için')) {
        msg = 'B tipindeki çizgi ile kesişti. Lütfen farklı bir konuma ekleyin.';
      }
      setError(msg);
      setToastVariant('danger');
      setToastMessage(msg);
      setToastShow(true);
      setShowForm(false);
      setNewFeatureCoords(null);
      setNewFeatureType(null);
      overlayRef.current?.setPosition(undefined);
      console.error('Error creating feature:', err);
      removeEphemeralFeatures();
    } finally {
      setLoading(false);
    }
  };

  const getWKTFromCoordinates = (coords: [number, number][], type: DrawType): string => {
    if (type === 'Point') {
      return `POINT(${coords[0][0]} ${coords[0][1]})`;
    } else if (type === 'LineString') {
      const points = coords.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
      return `LINESTRING(${points})`;
    } else if (type === 'Polygon') {
      const points = coords.map(coord => `${coord[0]} ${coord[1]}`).join(', ');
      return `POLYGON((${points}))`;
    }
    return '';
  };

  const closePopup = (e: React.MouseEvent) => {
    e.preventDefault();
    overlayRef.current?.setPosition(undefined);
  };

  const olTypeToTr = (t: string) => (t === 'Point' ? 'Nokta' : t === 'LineString' ? 'Çizgi' : t);

  return (
    <div className="map-container" style={{ width: '100%', height: 'calc(100vh - 56px)', position: 'relative' }}>
      <div ref={mapRef} className="map" style={{ width: '100%', height: '100%' }} />

      <div
        ref={popupContainerRef}
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
          padding: '8px 12px',
          borderRadius: 8,
          minWidth: 160,
          transform: 'translate(-50%, -100%)',
          color: '#000',
        }}
      >
        <a
          href="#close"
          onClick={closePopup}
          style={{
            position: 'absolute',
            right: 6,
            top: 4,
            textDecoration: 'none',
            fontWeight: 'bold',
            color: '#000',
          }}
          aria-label="Kapat"
          title="Kapat"
        >
          ×
        </a>
        <div ref={popupContentRef} />
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <ButtonGroup vertical>
          <Button
            variant="success"
            onClick={() => setUploadModalOpen(true)}
            size="sm"
            disabled={!clickedFeatureId}
          >
            Foto Yükle
          </Button>
          <Button
            variant={drawingMode === 'Point' ? 'danger' : 'primary'}
            onClick={() => (drawingMode === 'Point' ? stopDrawing() : startDrawing('Point'))}
            size="sm"
          >
            {drawingMode === 'Point' ? 'İptal' : 'Nokta'}
          </Button>
          
          <Button
            variant={drawingMode === 'LineString' ? 'danger' : 'primary'}
            onClick={() => (drawingMode === 'LineString' ? stopDrawing() : startDrawing('LineString'))}
            size="sm"
          >
            {drawingMode === 'LineString' ? 'İptal' : 'Çizgi'}
          </Button>
          <Button
            variant={drawingMode === 'Polygon' ? 'danger' : 'primary'}
            onClick={() => (drawingMode === 'Polygon' ? stopDrawing() : startDrawing('Polygon'))}
            size="sm"
          >
            {drawingMode === 'Polygon' ? 'İptal' : 'Polygon'}
          </Button>

          <Button
            variant={areaSelectMode ? 'secondary' : 'primary'}
            onClick={toggleAreaSelectMode}
            size="sm"
          >
            {areaSelectMode ? 'Alan Seçimi Kapat' : 'Alan Seç'}
          </Button>

          {!isEditing && (
            <Button
              variant="warning"
              onClick={startEdit}
              size="sm"
              disabled={!lastClickedFeatureRef.current}
            >
              Düzenle
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="success" onClick={saveEdit} size="sm" disabled={loading}>Kaydet</Button>
              <Button variant="secondary" onClick={cancelEdit} size="sm" disabled={loading}>İptal</Button>
            </>
          )}
          {!isEditing && (
            <Button
              variant="danger"
              onClick={deleteSelected}
              size="sm"
              disabled={!lastClickedFeatureRef.current || loading}
            >
              Sil
            </Button>
          )}

          {areaStats && (
            <Button
              variant={showAreaList ? 'secondary' : 'primary'}
              onClick={() => setShowAreaList((s) => !s)}
              size="sm"
            >
              {showAreaList ? 'Listeyi Gizle' : 'Seçilenleri Listele'}
            </Button>
          )}
        </ButtonGroup>
      </div>

      

      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1100 }}>
        <Toast bg={toastVariant} onClose={() => setToastShow(false)} show={toastShow} delay={3000} autohide>
          <Toast.Body style={{ color: '#fff', fontWeight: 600 }}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {areaStats && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '140px',
            zIndex: 1000,
            background: 'white',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            minWidth: 220,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Seçili Alandaki Öğeler</div>
          <div>Nokta: {areaStats.points}</div>
          <div>Çizgi: {areaStats.lines}</div>
          <div>Poligon: {areaStats.polys}</div>
          <hr style={{ margin: '6px 0' }} />
          <div>
            <b>Toplam: {areaStats.total}</b>
          </div>
        </div>
      )}

      {showAreaList && areaSelectedFeatures.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '140px',
            right: '140px',
            zIndex: 1000,
            background: 'white',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            minWidth: 280,
            maxHeight: 300,
            overflowY: 'auto',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Seçili Alandaki Öğeler (Liste)</div>
          {areaSelectedFeatures.map((f, idx) => {
            const g = f.getGeometry();
            const t = g?.getType() ?? 'Unknown';
            const name = f.get('name') || f.get('featureData')?.name || `Öğe ${idx + 1}`;
            return (
              <div
                key={idx}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #eee' }}
              >
                <span title={name} style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {name}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>{olTypeToTr(t)}</span>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      const geom = f.getGeometry();
                      if (!geom || !mapInstanceRef.current) return;
                      const view = mapInstanceRef.current.getView();
                      if (geom.getType() === 'Point') {
                        const coord = (geom as Point).getCoordinates();
                        view.animate({ center: coord, zoom: Math.max(view.getZoom() ?? 6, 14), duration: 300 });
                      } else {
                        const extent = geom.getExtent();
                        view.fit(extent, { padding: [60, 60, 60, 60], duration: 300, maxZoom: 17 });
                      }
                    }}
                  >
                    Oraya Götür
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            maxWidth: '400px',
          }}
        >
          {error}
        </Alert>
      )}

      <FeatureForm
        show={showForm}
        onHide={() => {
          setShowForm(false);
          setNewFeatureCoords(null);
          setNewFeatureType(null);
          overlayRef.current?.setPosition(undefined);
          removeEphemeralFeatures();
        }}
        onSubmit={handleCreateFeature}
        coordinates={newFeatureCoords}
        featureType={newFeatureType}
        getWKT={getWKTFromCoordinates}
        loading={loading}
      />

      <PhotoUploadModal
        show={uploadModalOpen}
        onHide={() => setUploadModalOpen(false)}
        featureId={clickedFeatureId}
        onUploaded={async () => {
          if (!clickedFeatureId) return;
          try {
            const resp = await featureService.getById(clickedFeatureId);
            if (resp.success && resp.data && mapInstanceRef.current && vectorSourceRef.current) {
              const feats = vectorSourceRef.current.getFeatures();
              feats.forEach(f => {
                const fd = f.get('featureData');
                if (fd && fd.id === clickedFeatureId) {
                  f.set('featureData', resp.data);
                }
              });
            }
          } catch {}
        }}
      />

      <PhotoGalleryModal
        show={galleryOpen}
        onHide={() => setGalleryOpen(false)}
        title={galleryTitle}
        photos={galleryPhotos}
      />
    </div>
  );
};

export default MapComponent;
