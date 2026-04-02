import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Map as MapIcon,
  Bird,
  Notebook,
  ChevronRight,
  Home,
  Settings,
  Search,
  MoreVertical,
  Image as ImageIcon,
  MapPin,
  X,
  Camera,
  Upload,
  Info,
  Layers,
  Edit,
  Trash2,
  ChevronDown,
  Save,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useDropzone } from 'react-dropzone';
import BirdMap from './BirdMap';
import CustomImageMap from './CustomImageMap';
import './App.css';

// --- Default Data ---
const INITIAL_DATA = {
  projects: [],
  notebooks: [],
  customMaps: []
};

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('bird_catalog_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [activeProject, setActiveProject] = useState(data.projects[0]?.id || null);
  const [currentView, setCurrentView] = useState('home'); // project, home, map-editor
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [addItemType, setAddItemType] = useState('bird'); // bird, map

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState(null);

  const [activeSightMap, setActiveSightMap] = useState(null);

  useEffect(() => {
    localStorage.setItem('bird_catalog_data', JSON.stringify(data));
  }, [data]);

  const handleAddProject = (e) => {
    e.preventDefault();
    const name = e.target.projectName.value;
    const newProject = {
      id: uuidv4(),
      name,
      birds: [],
      maps: [],
      notebooks: []
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    setIsNewProjectModalOpen(false);
    setActiveProject(newProject.id);
    setCurrentView('project');
  };

  const deleteProject = (id) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
    if (activeProject === id) {
      setActiveProject(null);
      setCurrentView('home');
    }
  };

  const moveProject = (fromIndex, toIndex) => {
    const updatedProjects = [...data.projects];
    const [movedProject] = updatedProjects.splice(fromIndex, 1);
    updatedProjects.splice(toIndex, 0, movedProject);
    setData(prev => ({ ...prev, projects: updatedProjects }));
  };

  const startRenaming = (project) => {
    setProjectToRename(project);
    setIsRenameModalOpen(true);
  };

  const handleRenameProject = (e) => {
    e.preventDefault();
    const newName = e.target.projectName.value;
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === projectToRename.id ? { ...p, name: newName } : p)
    }));
    setIsRenameModalOpen(false);
    setProjectToRename(null);
  };

  const currentProjectData = data.projects.find(p => p.id === activeProject);

  return (
    <div className="app-container">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="logo-section">
          <button className="menu-toggle" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            <Menu size={24} />
          </button>
          <div className="logo-box">
            <img src="/assets/logo.png" style={{ width: '38px', height: '38px', objectFit: 'contain' }} alt="Logo" />
          </div>
          <div className="site-brand">
            <h1 className="site-title">Watch the Wing</h1>
            <p className="site-subtitle">Log the Thing</p>
          </div>
        </div>

        <div className="search-bar-container">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search sightings..."
            />
          </div>
        </div>

        <div className="user-section">
          <div style={{ position: 'relative' }}>
            <button className="plus-btn" onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)} disabled={!activeProject}>
              <Plus size={24} />
            </button>
            {isAddDropdownOpen && (
              <div className="dropdown-menu">
                <button onClick={() => { setAddItemType('bird'); setIsAddItemModalOpen(true); setIsAddDropdownOpen(false); }}>
                  <Bird size={16} /> Create New Bird
                </button>
                <button onClick={() => { setAddItemType('map'); setIsAddItemModalOpen(true); setIsAddDropdownOpen(false); }}>
                  <MapIcon size={16} /> Create New Map
                </button>
                <button onClick={() => { setAddItemType('note'); setIsAddItemModalOpen(true); setIsAddDropdownOpen(false); }}>
                  <Notebook size={16} /> Create Research Note
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={`main-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`} style={{ background: '#f8fafc' }}>
        <aside className="side-bar">
          <div className="nav-section">
            <button className={`nav-item ${currentView === 'home' ? 'active' : ''}`} onClick={() => { setActiveProject(null); setCurrentView('home'); }}>
              <Home size={20} />
              <span className="nav-text">Home Dashboard</span>
            </button>
            <button className={`nav-item ${currentView === 'bird-search' ? 'active' : ''}`} onClick={() => { setActiveProject(null); setCurrentView('bird-search'); }}>
              <Search size={20} />
              <span className="nav-text">Bird Encyclopedia</span>
            </button>
            <button className={`nav-item ${currentView === 'bird-anatomy' ? 'active' : ''}`} onClick={() => { setActiveProject(null); setCurrentView('bird-anatomy'); }}>
              <Info size={20} />
              <span className="nav-text">Bird Anatomy</span>
            </button>
          </div>

          <div className="nav-section">
            <h3 className="nav-label">Research Projects</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {data.projects.map(proj => (
                <div
                  key={proj.id}
                  className={`project-sidebar-item ${activeProject === proj.id ? 'active' : ''}`}
                  onClick={() => { setActiveProject(proj.id); setCurrentView('project'); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, overflow: 'hidden' }}>
                    <Layers size={18} />
                    <span className="nav-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proj.name}</span>
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="project-actions">
                      <button className="icon-btn xs" onClick={(e) => { e.stopPropagation(); startRenaming(proj); }}><Edit size={12} /></button>
                      <button className="icon-btn xs" onClick={(e) => { e.stopPropagation(); if (confirm("Delete this project?")) deleteProject(proj.id); }} style={{ color: '#ef4444' }}><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
              ))}
              <button
                className="nav-item new-proj-btn"
                onClick={() => setIsNewProjectModalOpen(true)}
                style={{ marginTop: '12px', background: 'var(--primary-blue)', color: 'white', fontWeight: 700 }}
              >
                <Plus size={18} />
                <span className="nav-text">New Project</span>
              </button>
            </div>
          </div>
        </aside>

        <section className="content-area">
          {currentView === 'bird-search' ? (
            <BirdSearchView data={data} setData={setData} activeProject={activeProject} />
          ) : currentView === 'bird-anatomy' ? (
            <BirdAnatomyView />
          ) : activeProject && currentProjectData ? (
            <ProjectView
              project={currentProjectData}
              data={data}
              setData={setData}
              onNavigate={(projId, birdId) => {
                setActiveProject(projId);
                setCurrentView('project');
              }}
            />
          ) : data.projects.length > 0 || currentView === 'home' ? (
            <HomeView data={data} onGoToBird={(projId, bird) => {
              setActiveProject(projId);
              setCurrentView('project');
              localStorage.setItem('pending_expanded_bird', JSON.stringify(bird));
            }} />
          ) : (
            <div className="welcome-view fade-in">
              <div style={{ textAlign: 'center', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', margin: '0 auto' }}>
                <div style={{ background: '#eff6ff', width: '120px', height: '120px', borderRadius: '30px', margin: '0 0 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-5deg)' }}>
                  <Bird size={64} color="var(--primary-blue)" />
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#1e293b', marginBottom: '16px' }}>Ready to Log?</h1>
                <p style={{ fontSize: '1.25rem', color: '#64748b', lineHeight: 1.6, marginBottom: '40px' }}>
                  Select a research project from the sidebar to start cataloging birds, creating custom field maps, and taking detailed research notes.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="primary-btn" style={{ padding: '20px 32px', fontSize: '1.1rem' }} onClick={() => setIsNewProjectModalOpen(true)}>
                    <Plus size={24} /> Create Your First Project
                  </button>
                  <button className="nav-item" style={{ padding: '20px 32px', fontSize: '1.1rem', background: 'white', border: '2px solid #e2e8f0' }} onClick={() => setCurrentView('bird-search')}>
                    <Search size={24} /> Explore Encyclopedia
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {isNewProjectModalOpen && (
        <Modal onClose={() => setIsNewProjectModalOpen(false)} title="New Research Project">
          <form onSubmit={handleAddProject}>
            <div className="form-group">
              <label>Project Name</label>
              <input name="projectName" autoFocus placeholder="e.g., Oyster Bay Preservation, Backyard 2024" required />
            </div>
            <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center', padding: '16px', marginTop: '20px' }}>
              Create Project
            </button>
          </form>
        </Modal>
      )}

      {isAddItemModalOpen && (
        <Modal onClose={() => setIsAddItemModalOpen(false)} title={`Add ${addItemType === 'bird' ? 'Bird' : addItemType === 'map' ? 'Map' : 'Research Note'} to Project`}>
          <AddItemForm
            type={addItemType}
            project={currentProjectData}
            onSubmit={(item) => {
              const newData = { ...data };
              const projIndex = newData.projects.findIndex(p => p.id === activeProject);
              if (projIndex > -1) {
                const key = addItemType === 'bird' ? 'birds' : addItemType === 'map' ? 'maps' : 'notebooks';
                if (!newData.projects[projIndex][key]) newData.projects[projIndex][key] = [];
                newData.projects[projIndex][key].push({ ...item, id: uuidv4(), date: new Date().toISOString() });
                setData(newData);
              }
              setIsAddItemModalOpen(false);
            }}
          />
        </Modal>
      )}

      {isRenameModalOpen && (
        <Modal onClose={() => setIsRenameModalOpen(false)} title="Rename Project">
          <form onSubmit={handleRenameProject}>
            <div className="form-group">
              <label>New Project Name</label>
              <input name="projectName" defaultValue={projectToRename?.name} required autoFocus />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button type="button" className="nav-item" onClick={() => setIsRenameModalOpen(false)}>Cancel</button>
              <button type="submit" className="primary-btn">Rename</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// --- Layout Helpers ---
function Modal({ children, onClose, title }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Sub Components ---

function HomeView({ data, onGoToBird }) {
  const totalBirds = data.projects.reduce((acc, p) => acc + p.birds.length, 0);
  const totalMaps = data.projects.reduce((acc, p) => acc + (p.maps?.length || 0), 0);

  // Aggregate sightings with project info
  const recentSightings = data.projects.flatMap(p =>
    p.birds.map(b => ({ ...b, projId: p.id, projName: p.name }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  return (
    <div className="fade-in home-container">
      <header className="home-header">
        <h1>Field Dashboard</h1>
        <p>Global monitoring of your bird-watching research across {data.projects.length} projects.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card blue">
          <Bird size={42} className="stat-icon" />
          <div className="stat-val">{totalBirds}</div>
          <div className="stat-label">Species Cataloged</div>
        </div>
        <div className="stat-card">
          <MapIcon size={42} className="stat-icon" color="var(--primary-blue)" />
          <div className="stat-val">{totalMaps}</div>
          <div className="stat-label">Research Maps</div>
        </div>
        <div className="stat-card">
          <Plus size={42} className="stat-icon" color="#10b981" />
          <div className="stat-val">{data.projects.length}</div>
          <div className="stat-label">Total Projects</div>
        </div>
      </div>

      <div className="sightings-section">
        <h3 className="section-title">Recent Sightings</h3>
        <div className="sightings-list">
          {recentSightings.map(bird => (
            <div key={bird.id} className="sighting-item" onClick={() => onGoToBird(bird.projId, bird)}>
              <img src={bird.photos?.[0] || bird.photo || "/assets/logo.png"} className="sighting-img" />
              <div className="sighting-info">
                <h4>{bird.name}</h4>
                <p>Logged in <b>{bird.projName}</b> &bull; {new Date(bird.date).toLocaleDateString()}</p>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          ))}
          {totalBirds === 0 && (
            <div className="empty-state">
              <p>No sightings yet. Start by creating a project!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SightMap({ project, mapData, onUpdateMap }) {
  const [pins, setPins] = useState(mapData.pins || []);
  const [flightPaths, setFlightPaths] = useState(mapData.flightPaths || []);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [tempPinPos, setTempPinPos] = useState(null);
  const [pinType, setPinType] = useState('bird');
  const [selectedBird, setSelectedBird] = useState(null);
  const [customLabel, setCustomLabel] = useState('');
  const [viewingBird, setViewingBird] = useState(null);
  const [viewingPin, setViewingPin] = useState(null);

  // ── Freehand drawing state ────────────────────────────────────────────────
  const [drawingPathForPinId, setDrawingPathForPinId] = useState(null);
  const [livePoints, setLivePoints] = useState([]);      // current stroke being drawn
  const [pendingLabel, setPendingLabel] = useState('');   // text in the floating label input
  const [labelQueue, setLabelQueue] = useState([]);       // labels queued to stamp on next point
  const [stampedLabels, setStampedLabels] = useState([]); // { label, pointIndex } – labels applied so far
  const labelInputRef = useRef(null);
  const livePointsRef = useRef([]);                       // kept in sync for closures

  // ── Normal map click (non-drawing) ────────────────────────────────────────
  const handleMapClick = (latlng) => {
    if (drawingPathForPinId) return; // handled by freehand
    setTempPinPos(latlng);
    setIsPinModalOpen(true);
    setSelectedBird(null);
    setPinType('bird');
    setCustomLabel('');
  };

  const savePin = () => {
    let newPin;
    if (pinType === 'bird') {
      if (!selectedBird) return;
      newPin = { id: uuidv4(), lat: tempPinPos.lat, lng: tempPinPos.lng, type: 'bird', birdId: selectedBird.id, name: selectedBird.name, label: selectedBird.name };
    } else {
      if (!customLabel.trim()) return;
      newPin = { id: uuidv4(), lat: tempPinPos.lat, lng: tempPinPos.lng, type: 'note', name: customLabel, label: customLabel };
    }
    const updatedPins = [...pins, newPin];
    setPins(updatedPins);
    onUpdateMap(mapData.id, updatedPins, flightPaths);
    setIsPinModalOpen(false);
  };

  const deletePin = (id) => {
    const updatedPins = pins.filter(p => p.id !== id);
    const updatedPaths = flightPaths.filter(p => p.pinId !== id);
    setPins(updatedPins);
    setFlightPaths(updatedPaths);
    onUpdateMap(mapData.id, updatedPins, updatedPaths);
    setViewingPin(null);
    setViewingBird(null);
  };

  // ── Start freehand drawing ────────────────────────────────────────────────
  const startDrawingPath = (pinId) => {
    setDrawingPathForPinId(pinId);
    setLivePoints([]);
    livePointsRef.current = [];
    setLabelQueue([]);
    setStampedLabels([]);
    setPendingLabel('');
    setViewingPin(null);
    setViewingBird(null);
    setTimeout(() => labelInputRef.current?.focus(), 200);
  };

  // ── Queue a label to be stamped on the next drawn point ──────────────────
  const queueLabel = () => {
    const text = pendingLabel.trim();
    if (!text) return;
    setLabelQueue(q => [...q, text]);
    setPendingLabel('');
    labelInputRef.current?.focus();
  };

  // ── Called by BirdMap as the user draws ──────────────────────────────────
  const handleFreehandPoint = useCallback((latlng, phase) => {
    const newPoint = { lat: latlng.lat, lng: latlng.lng, label: null };

    // Consume the next queued label if one exists
    setLabelQueue(q => {
      if (q.length > 0) {
        newPoint.label = q[0];
        setStampedLabels(s => [...s, { label: q[0], pointIndex: livePointsRef.current.length }]);
        return q.slice(1);
      }
      return q;
    });

    livePointsRef.current = [...livePointsRef.current, newPoint];
    setLivePoints([...livePointsRef.current]);
  }, []);

  // ── Finish / save the drawn stroke ───────────────────────────────────────
  const finishPath = () => {
    const pts = livePointsRef.current;
    if (pts.length < 2) {
      setDrawingPathForPinId(null);
      return;
    }
    const updatedPaths = flightPaths.filter(p => p.pinId !== drawingPathForPinId);
    const existing = flightPaths.find(p => p.pinId === drawingPathForPinId);
    const basePoints = existing ? existing.points : [];
    updatedPaths.push({
      pinId: drawingPathForPinId,
      points: [...basePoints, ...pts]
    });
    setFlightPaths(updatedPaths);
    onUpdateMap(mapData.id, pins, updatedPaths);
    setDrawingPathForPinId(null);
    setLivePoints([]);
    livePointsRef.current = [];
    setLabelQueue([]);
    setStampedLabels([]);
  };

  const resetPath = () => {
    setLivePoints([]);
    livePointsRef.current = [];
    setLabelQueue([]);
    setStampedLabels([]);
    setPendingLabel('');
  };

  const cancelDrawing = () => {
    setDrawingPathForPinId(null);
    resetPath();
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>

      {/* ── FREEHAND DRAWING HUD ─────────────────────────────────────────── */}
      {drawingPathForPinId && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2000,
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: '16px',
          boxShadow: '0 4px 24px rgba(79,70,229,0.5)',
          flexWrap: 'wrap'
        }}>
          {/* Bird name + instructions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '10px' }}>
              <Bird size={20} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)' }}>Tracing Flight Path · Map Locked</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{pins.find(p => p.id === drawingPathForPinId)?.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.75)', marginTop: '1px' }}>Draw with your mouse, finger, or stylus</div>
            </div>
          </div>

          {/* Floating label input – type terms, hit Enter or + to queue them */}
          <div style={{ flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
              border: '1.5px solid rgba(255,255,255,0.3)'
            }}>
              <input
                ref={labelInputRef}
                value={pendingLabel}
                onChange={e => setPendingLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); queueLabel(); } }}
                placeholder="Type a label… press Enter to queue"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: 'white', fontSize: '0.9rem', fontWeight: 600
                }}
              />
              {pendingLabel.trim() && (
                <button
                  onClick={queueLabel}
                  style={{ background: 'white', color: '#4f46e5', border: 'none', borderRadius: '6px', padding: '3px 10px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer' }}
                >+ Queue</button>
              )}
            </div>

            {/* Queue pill badges */}
            {labelQueue.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                {labelQueue.map((lbl, i) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.25)', color: 'white', borderRadius: '20px',
                    padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    {lbl}
                    <button onClick={() => setLabelQueue(q => q.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '0.85rem', lineHeight: 1, padding: 0, marginLeft: '2px' }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Stats pill */}
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', flexShrink: 0 }}>
            {livePoints.length} pts · {stampedLabels.length} labels
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button onClick={resetPath} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Reset Stroke</button>
            <button onClick={cancelDrawing} style={{ background: 'rgba(255,0,0,0.25)', color: 'white', border: '1.5px solid rgba(255,100,100,0.4)', borderRadius: '10px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>Cancel</button>
            <button onClick={finishPath} style={{ background: 'white', color: '#4f46e5', border: 'none', borderRadius: '10px', padding: '8px 20px', fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>✓ Save Path</button>
          </div>
        </div>
      )}

      <BirdMap
        initialPosition={mapData.center}
        flightPaths={flightPaths}
        drawingMode={!!drawingPathForPinId}
        livePoints={livePoints}
        onFreehandPoint={handleFreehandPoint}
        markers={pins.map(p => ({
          ...p,
          color: p.type === 'note' ? '#10b981' : '#3b82f6',
          onClick: () => {
            if (drawingPathForPinId) return;
            if (p.type === 'bird') {
              setViewingBird(project.birds.find(b => b.id === p.birdId));
              setViewingPin(p);
            } else {
              setViewingPin(p);
            }
          }
        }))}
        onMark={handleMapClick}
      />

      {!drawingPathForPinId && (
        <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, pointerEvents: 'none' }}>
          <p style={{ background: 'white', padding: '12px 28px', borderRadius: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-blue)', border: '2.5px solid var(--primary-blue)', pointerEvents: 'auto', whiteSpace: 'nowrap' }}>
            Click map to place pins · Select a bird pin to trace its flight path
          </p>
        </div>
      )}

      {isPinModalOpen && (
        <Modal onClose={() => setIsPinModalOpen(false)} title="Add Map Pin">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button className={`nav-item ${pinType === 'bird' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setPinType('bird')}><Bird size={16} /> Bird Sighting</button>
            <button className={`nav-item ${pinType === 'note' ? 'active' : ''}`} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setPinType('note')}><Edit size={16} /> Label / Note</button>
          </div>
          {pinType === 'bird' ? (
            <>
              <p style={{ color: '#64748b', marginBottom: '16px' }}>Which bird did you see here?</p>
              <div className="pin-modal-list">
                {project.birds.map(bird => (
                  <div key={bird.id} className={`pin-bird-item ${selectedBird?.id === bird.id ? 'active' : ''}`} onClick={() => setSelectedBird(bird)} style={{ background: selectedBird?.id === bird.id ? '#eff6ff' : '' }}>
                    <img src={bird.photos?.[0] || bird.photo || "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=100"} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                    <span style={{ fontWeight: 600 }}>{bird.name}</span>
                  </div>
                ))}
                {project.birds.length === 0 && <p style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No birds cataloged in this project yet.</p>}
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Custom Label</label>
              <input placeholder="e.g., Home, Favorite Spot, Cavity Tree..." value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} autoFocus />
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button className="nav-item" onClick={() => setIsPinModalOpen(false)}>Cancel</button>
            <button className="primary-btn" onClick={savePin} disabled={pinType === 'bird' ? !selectedBird : !customLabel.trim()}>Place Pin</button>
          </div>
        </Modal>
      )}

      {viewingPin && (
        <Modal onClose={() => { setViewingPin(null); setViewingBird(null); }} title={viewingPin.name}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {viewingBird && (
              <>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {(viewingBird.photos || [viewingBird.photo]).map((url, i) => (
                    <img key={i} src={url || "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600"} style={{ height: '300px', width: 'auto', borderRadius: '16px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                  ))}
                </div>
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><Info size={18} color="var(--primary-blue)" /> Bird Details</h4>
                  <p style={{ color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>{viewingBird.notes || 'No notes available for this bird.'}</p>
                </div>
              </>
            )}
            {!viewingBird && <p style={{ color: '#475569', background: '#fef3c7', padding: '16px', borderRadius: '12px', border: '1px solid #fcd34d', fontWeight: 500 }}>This is a custom location marker.</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              {viewingBird && (
                <button className="primary-btn" onClick={() => startDrawingPath(viewingPin.id)} style={{ flex: 1, background: '#6366f1', gap: '8px' }}>
                  <Plus size={18} /> {flightPaths.find(p => p.pinId === viewingPin.id) ? 'Continue Flight Path' : 'Trace Flight Path'}
                </button>
              )}
              {flightPaths.find(p => p.pinId === viewingPin.id) && (
                <button className="primary-btn" onClick={() => { const up = flightPaths.filter(p => p.pinId !== viewingPin.id); setFlightPaths(up); onUpdateMap(mapData.id, pins, up); setViewingPin(null); }} style={{ flex: 0.5, background: '#fee2e2', color: '#ef4444', border: '1.5px solid #fecaca' }}>Delete Path</button>
              )}
            </div>
            <button className="icon-btn" style={{ color: '#ef4444', border: '1px solid #fee2e2', background: '#fef2f2', padding: '10px 16px', gap: '8px', borderRadius: '12px', width: 'auto' }} onClick={() => deletePin(viewingPin.id)}>
              <Trash2 size={20} /> <span style={{ fontWeight: 700 }}>Delete Pin</span>
            </button>
            <button className="nav-item" style={{ border: '1.5px solid #e2e8f0' }} onClick={() => { setViewingPin(null); setViewingBird(null); }}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ProjectView({ project, data, setData }) {
  const [expandedBird, setExpandedBird] = useState(null);
  const [activeMap, setActiveMap] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [isEditingBird, setIsEditingBird] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);

  useEffect(() => {
    const pending = localStorage.getItem('pending_expanded_bird');
    if (pending) {
      setExpandedBird(JSON.parse(pending));
      localStorage.removeItem('pending_expanded_bird');
    }
  }, [project.id]);

  const updateProjectData = (key, items) => {
    const newData = { ...data };
    const projIdx = newData.projects.findIndex(p => p.id === project.id);
    if (projIdx > -1) {
      newData.projects[projIdx][key] = items;
      setData(newData);
    }
  };

  const deleteItem = (key, id) => {
    if (!confirm(`Delete this ${key.slice(0, -1)}?`)) return;
    const updatedItems = project[key].filter(item => item.id !== id);
    updateProjectData(key, updatedItems);
    setExpandedBird(null);
    setActiveMap(null);
    setActiveNote(null);
  };

  const handleUpdateBird = (birdData) => {
    const updatedBirds = project.birds.map(b => b.id === expandedBird.id ? { ...b, ...birdData } : b);
    updateProjectData('birds', updatedBirds);
    setExpandedBird({ ...expandedBird, ...birdData });
    setIsEditingBird(false);
  };

  const handleUpdateNote = (noteData) => {
    const updatedNotes = project.notebooks.map(n => n.id === activeNote.id ? { ...n, ...noteData } : n);
    updateProjectData('notebooks', updatedNotes);
    setActiveNote({ ...activeNote, ...noteData });
    setIsEditingNote(false);
  };

  if (activeMap) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="fade-in">
        <header className="view-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <button className="icon-btn" onClick={() => setActiveMap(null)}><ArrowLeft size={20} /></button>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{activeMap.name}</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{project.name} &bull; {activeMap.pins?.length || 0} pins</p>
            </div>
          </div>
          <button className="icon-btn" style={{ color: '#ef4444' }} onClick={() => deleteItem('maps', activeMap.id)}><Trash2 size={18} /></button>
        </header>
        <div style={{ flex: 1 }}>
          <SightMap project={project} mapData={activeMap} onUpdateMap={(id, pins, flightPaths) => {
            const updatedMaps = project.maps.map(m => m.id === id ? { ...m, pins, flightPaths } : m);
            updateProjectData('maps', updatedMaps);
          }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }} className="fade-in">
      <header className="view-header">
        <div>
          <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800 }}>
            <span style={{ background: '#eff6ff', padding: '10px', borderRadius: '14px', display: 'flex' }}><Bird size={28} color="var(--primary-blue)" /></span>
            {project.name}
          </h2>
          <p style={{ color: '#64748b', marginLeft: '60px', marginTop: '4px' }}>{project.birds.length} birds & {project.notebooks?.length || 0} research notes</p>
        </div>
      </header>

      <div style={{ padding: '40px' }}>
        {/* Birds Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="section-title"><ImageIcon size={20} color="var(--primary-blue)" /> Bird Catalog</h3>
        </div>
        <div className="bird-grid" style={{ marginBottom: '64px' }}>
          {project.birds.map(bird => (
            <div key={bird.id} className="bird-card" onClick={() => setExpandedBird(bird)}>
              <img src={bird.photos?.[0] || bird.photo || "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=400"} className="bird-img" alt={bird.name} />
              <div className="bird-info">
                <h3 className="bird-name">{bird.name}</h3>
                <p className="bird-notes-preview">{bird.notes?.substring(0, 60)}{bird.notes?.length > 60 ? '...' : ''}</p>
              </div>
            </div>
          ))}
          {project.birds.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', background: '#f8fafc', borderRadius: '20px', border: '2.5px dashed #e2e8f0' }}>
              <Bird size={40} style={{ opacity: 0.1, marginBottom: '12px' }} />
              <p style={{ color: '#94a3b8' }}>Catalog your first bird to begin the project.</p>
            </div>
          )}
        </div>

        {/* Notebooks Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="section-title"><Notebook size={20} color="#8b5cf6" /> Research Notebooks</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '64px' }}>
          {project.notebooks?.map(note => (
            <div key={note.id} className="bird-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveNote(note)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{note.title}</h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(note.date).toLocaleDateString()}</p>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>{note.content.substring(0, 100)}...</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                {note.photos?.length > 0 && <span style={{ padding: '4px 8px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.7rem', color: '#64748b' }}>{note.photos.length} Photos</span>}
                {note.linkedBirdIds?.length > 0 && <span style={{ padding: '4px 8px', background: '#eff6ff', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--primary-blue)', fontWeight: 700 }}>{note.linkedBirdIds.length} Birds</span>}
                {note.linkedMapIds?.length > 0 && <span style={{ padding: '4px 8px', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>{note.linkedMapIds.length} Maps</span>}
              </div>
            </div>
          ))}
          {project.notebooks?.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', background: '#f8fafc', borderRadius: '20px', border: '2.5px dashed #e2e8f0' }}>
              <p style={{ color: '#94a3b8' }}>No research notes yet. Click the <b>+</b> to start a study.</p>
            </div>
          )}
        </div>

        {/* Maps Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 className="section-title"><MapIcon size={20} color="#f59e0b" /> Project Maps</h3>
        </div>
        <div className="map-grid">
          {project.maps?.map(map => (
            <div key={map.id} className="map-card" onClick={() => setActiveMap(map)}>
              <div className="map-card-icon"><Layers size={24} /></div>
              <div className="map-card-info" style={{ flex: 1 }}>
                <h4>{map.name}</h4>
                <p>{map.pins?.length || 0} locations pinned</p>
              </div>
              <ChevronRight size={20} color="#cbd5e1" />
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Bird Modal */}
      {expandedBird && (
        <Modal onClose={() => setExpandedBird(null)} title={expandedBird.name}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
              {(expandedBird.photos || [expandedBird.photo]).map((url, i) => (
                <img key={i} src={url || "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600"} style={{ height: '350px', width: 'auto', borderRadius: '16px', objectFit: 'cover' }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
               <div className="stat-card" style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Wingspan</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{expandedBird.wingspan || 'N/A'}</div>
               </div>
               <div className="stat-card" style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Length</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px' }}>{expandedBird.length || 'N/A'}</div>
               </div>
               <div className="stat-card" style={{ padding: '16px', background: expandedBird.status === 'Endangered' ? '#fef2f2' : '#f8fafc', borderRadius: '12px', border: '1.5px dashed ' + (expandedBird.status === 'Endangered' ? '#fca5a5' : '#e2e8f0') }}>
                  <div style={{ fontSize: '0.65rem', color: expandedBird.status === 'Endangered' ? '#ef4444' : '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px', color: expandedBird.status === 'Endangered' ? '#ef4444' : 'inherit' }}>{expandedBird.status || 'Secure'}</div>
               </div>
            </div>

            {expandedBird.recordings && expandedBird.recordings.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="var(--primary-blue)" /> Field Recordings & Calls
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {expandedBird.recordings.slice(0, 3).map((rec, i) => (
                    <div key={i} style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <audio src={rec.file} controls style={{ height: '32px', flex: 1 }} />
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        <div style={{ fontWeight: 700 }}>{rec.rec}</div>
                        <div>{rec.length}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', fontWeight: 700 }}>
                <Notebook size={22} color="#8b5cf6" /> Natural History & Observations
              </h4>
              <div style={{ color: '#334155', lineHeight: 1.7, background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '120px' }}>
                {expandedBird.notes || 'No observations recorded yet.'}
              </div>
            </div>

            <div>
               <h4 style={{ marginBottom: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Info size={18} color="var(--primary-blue)" /> Taxonomy & Distribution
               </h4>
               <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Scientific Name</span>
                     <span style={{ fontWeight: 700, fontStyle: 'italic' }}>{expandedBird.scientificName || 'N/A'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Family</span>
                     <span style={{ fontWeight: 700 }}>{expandedBird.family || 'N/A'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Genus</span>
                     <span style={{ fontWeight: 700 }}>{expandedBird.genus || 'N/A'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Order</span>
                     <span style={{ fontWeight: 700 }}>{expandedBird.order || 'N/A'}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Region</span>
                     <span style={{ fontWeight: 700 }}>{Array.isArray(expandedBird.region) ? expandedBird.region.join(', ') : expandedBird.region || 'N/A'}</span>
                  </li>
               </ul>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="nav-item" onClick={() => setIsEditingBird(true)}><Edit size={18} /> Edit Bird</button>
              <button className="nav-item" onClick={() => deleteItem('birds', expandedBird.id)} style={{ color: '#ef4444' }}><Trash2 size={18} /> Delete Bird</button>
              <button className="primary-btn" style={{ flex: 1 }} onClick={() => setExpandedBird(null)}>Close</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Immersive Note Editor View */}
      {activeNote && (
        <div className="note-fullscreen-overlay fade-in">
          <div className="note-content-container">
            <header className="note-header">
              <div className="note-meta">
                <p>{new Date(activeNote.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', marginRight: '16px' }}>
                  {activeNote.linkedBirdIds?.map(id => {
                    const b = project.birds.find(bird => bird.id === id);
                    return b ? <div key={id} onClick={() => { setExpandedBird(b); setActiveNote(null); }} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer' }}><img src={b.photos?.[0] || b.photo || "/vite.svg"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : null;
                  })}
                </div>
                <button className="icon-btn" onClick={() => deleteItem('notebooks', activeNote.id)} style={{ color: '#ef4444' }} title="Delete Note"><Trash2 size={20} /></button>
                <button className="primary-btn" onClick={() => setActiveNote(null)}>Save & Close</button>
              </div>
            </header>
            <div className="note-editor">
              <input
                className="note-title-input"
                value={activeNote.title}
                spellCheck="false"
                onChange={(e) => handleUpdateNote({ ...activeNote, title: e.target.value })}
                placeholder="Note Title"
              />
              <textarea
                className="note-body-textarea"
                value={activeNote.content}
                onChange={(e) => handleUpdateNote({ ...activeNote, content: e.target.value })}
                placeholder="Start typing your research findings..."
              />

              {activeNote.photos?.length > 0 && (
                <div style={{ marginTop: '40px' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>Attached Media</h4>
                  <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '20px' }}>
                    {activeNote.photos.map((src, i) => (
                      <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={src} style={{ height: '180px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <button
                          className="icon-btn xs"
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}
                          onClick={() => handleUpdateNote({ ...activeNote, photos: activeNote.photos.filter((_, idx) => idx !== i) })}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Bird Modal */}
      {isEditingBird && (
        <Modal onClose={() => setIsEditingBird(false)} title={`Edit ${expandedBird.name}`}>
          <AddItemForm
            type="bird"
            project={project}
            initialData={expandedBird}
            onSubmit={handleUpdateBird}
          />
        </Modal>
      )}

      {/* Edit Note Modal */}
      {isEditingNote && (
        <Modal onClose={() => setIsEditingNote(false)} title={`Edit ${activeNote.title}`}>
          <AddItemForm
            type="note"
            project={project}
            initialData={activeNote}
            onSubmit={handleUpdateNote}
          />
        </Modal>
      )}
    </div>
  );
}

function AddItemForm({ type, onSubmit, project, initialData = null }) {
  const [photos, setPhotos] = useState(initialData?.photos || (initialData?.photo ? [initialData.photo] : []));
  const [mapCenter, setMapCenter] = useState(initialData?.center || [40.8751, -73.5323]);
  const [mapZoom, setMapZoom] = useState(initialData?.zoom || 13);
  const [gettingLocation, setGettingLocation] = useState(false);

  const [selectedBirds, setSelectedBirds] = useState(initialData?.linkedBirdIds || []);
  const [selectedMaps, setSelectedMaps] = useState(initialData?.linkedMapIds || []);

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true
  });

  useEffect(() => {
    if (type === 'map' && !initialData && navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setGettingLocation(false);
        },
        () => setGettingLocation(false)
      );
    }
  }, [type, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (type === 'bird') {
      data.photos = photos;
      onSubmit(data);
    } else if (type === 'map') {
      data.center = mapCenter;
      data.zoom = mapZoom;
      data.pins = initialData?.pins || [];
      onSubmit(data);
    } else if (type === 'note') {
      data.photos = photos;
      data.linkedBirdIds = selectedBirds;
      data.linkedMapIds = selectedMaps;
      onSubmit(data);
    }
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleBird = (id) => {
    setSelectedBirds(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  const toggleMap = (id) => {
    setSelectedMaps(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  if (type === 'bird') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Bird Name</label>
          <input name="name" defaultValue={initialData?.name} placeholder="e.g., American Goldfinch" required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Scientific Name</label>
            <input name="scientificName" defaultValue={initialData?.scientificName} placeholder="e.g. Spinus tristis" />
          </div>
          <div className="form-group">
            <label>Family</label>
            <input name="family" defaultValue={initialData?.family} placeholder="e.g. Fringillidae" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Genus</label>
            <input name="genus" defaultValue={initialData?.genus} placeholder="e.g. Spinus" />
          </div>
          <div className="form-group">
            <label>Order</label>
            <input name="order" defaultValue={initialData?.order} placeholder="e.g. Passeriformes" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label>Wingspan</label>
            <input name="wingspan" defaultValue={initialData?.wingspan} placeholder="e.g. 15-20 cm" />
          </div>
          <div className="form-group">
            <label>Physical Length</label>
            <input name="length" defaultValue={initialData?.length} placeholder="e.g. 10-12 cm" />
          </div>
        </div>
        <div className="form-group">
          <label>Notes & Behavior</label>
          <textarea name="notes" defaultValue={initialData?.notes} placeholder="Describe the bird, what it was doing, where it was..." rows={6}></textarea>
        </div>
        <div className="form-group">
          <label>Sightings Photos (Drag & Drop)</label>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <Camera size={32} color="#94a3b8" />
            <p>{isDragActive ? "Drop the files here" : "Drag photos here or click to upload"}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                <button type="button" className="icon-btn xs" style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white' }} onClick={() => removePhoto(i)}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <Save size={18} /> {initialData ? 'Update Bird' : 'Save Bird Catalog'}
          </button>
        </div>
      </form>
    );
  }

  if (type === 'map') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Map Name</label>
          <input name="name" defaultValue={initialData?.name} placeholder="e.g., Backyard Feeding Area" required />
        </div>

        <div className="form-group">
          <label>Select Your Map Area {gettingLocation && <span style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', fontWeight: 400 }}>(Locating...)</span>}</label>
          <div style={{ height: '350px', background: '#f1f5f9', borderRadius: '16px', border: '2px solid #e2e8f0', overflow: 'hidden' }}>
            <BirdMap
              initialPosition={mapCenter}
              onMove={(center, zoom) => {
                setMapCenter([center.lat, center.lng]);
                setMapZoom(zoom);
              }}
              pickerMode={true}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
          <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            <Plus size={18} /> {initialData ? 'Update Map' : 'Confirm & Create Map'}
          </button>
        </div>
      </form>
    );
  }

  if (type === 'note') {
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Study Title</label>
          <input name="title" defaultValue={initialData?.title} placeholder="e.g., Mystery cavity in the old oak" required />
        </div>
        <div className="form-group">
          <label>Observations & Research</label>
          <textarea name="content" defaultValue={initialData?.content} placeholder="Describe your findings, theories..." rows={6} required></textarea>
        </div>

        <div className="form-group">
          <label>Reference Photos</label>
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <ImageIcon size={32} color="#94a3b8" />
            <p>Drag study photos here</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: '100px', height: '100px' }}>
                <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '1.5px solid #e2e8f0' }} />
                <button type="button" className="icon-btn xs" style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white' }} onClick={() => removePhoto(i)}><X size={12} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Link Cataloged Birds</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {project?.birds?.map(bird => (
              <div
                key={bird.id}
                onClick={() => toggleBird(bird.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: '2px solid',
                  borderColor: selectedBirds.includes(bird.id) ? 'var(--primary-blue)' : '#e2e8f0',
                  background: selectedBirds.includes(bird.id) ? '#eff6ff' : 'white',
                  color: selectedBirds.includes(bird.id) ? 'var(--primary-blue)' : '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {bird.name}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Link Relevant Maps</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {project?.maps?.map(map => (
              <div
                key={map.id}
                onClick={() => toggleMap(map.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: '2px solid',
                  borderColor: selectedMaps.includes(map.id) ? 'var(--primary-blue)' : '#e2e8f0',
                  background: selectedMaps.includes(map.id) ? '#eff6ff' : 'white',
                  color: selectedMaps.includes(map.id) ? 'var(--primary-blue)' : '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {map.name}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '40px' }}>
          <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
            <Save size={20} /> {initialData ? 'Update Research Note' : 'Save Research Note'}
          </button>
        </div>
      </form>
    );
  }

  return null;
}

function BirdSearchView({ data, setData, activeProject }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBird, setSelectedBird] = useState(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [birdWiki, setBirdWiki] = useState(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  useEffect(() => {
    if (selectedBird) {
      setWikiLoading(true);
      
      // Fetch detailed Nuthatch data (Recordings, etc.)
      fetch(`https://nuthatch.lastelm.software/v2/birds/${selectedBird.id}`, {
        headers: { 'api-key': NUTHATCH_API_KEY }
      })
      .then(res => res.json())
      .then(detail => {
        setSelectedBird(prev => ({ ...prev, ...detail }));
      })
      .catch(err => console.error("Nuthatch detail fetch failed", err));

      // Fetch Wikipedia bio
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(selectedBird.name.replace(/ /g, '_'))}`)
        .then(res => res.json())
        .then(data => {
          setBirdWiki(data.extract);
          setWikiLoading(false);
        })
        .catch(() => {
          setBirdWiki("Nesting and dietary information is available via field research. This species is part of the global monitoring database.");
          setWikiLoading(false);
        });
    } else {
      setBirdWiki(null);
    }
  }, [selectedBird?.id]); // Only trigger when the ID changes

  // Nuthatch API configuration
  const NUTHATCH_API_KEY = '194765a6-e284-46ba-82f9-939d0189fb4d';

  const saveBirdToProject = (projectId) => {
    const newData = { ...data };
    const projIdx = newData.projects.findIndex(p => p.id === projectId);
    if (projIdx > -1) {
        newData.projects[projIdx].birds.push({
          id: uuidv4(),
          name: selectedBird.name,
          scientificName: selectedBird.scientificName,
          family: selectedBird.family,
          genus: selectedBird.genus,
          order: selectedBird.order,
          region: selectedBird.region,
          wingspan: `${selectedBird.wingspanMin}-${selectedBird.wingspanMax} cm`,
          length: `${selectedBird.lengthMin}-${selectedBird.lengthMax} cm`,
          recordings: selectedBird.recordings || [],
          status: selectedBird.status || 'Unknown',
          notes: birdWiki || `Encyclopedia Research: ${selectedBird.scientificName} (${selectedBird.family}). Found in ${selectedBird.region?.join(', ') || 'N/A'}.`,
          photos: selectedBird.images || [],
          date: new Date().toISOString()
        });
      setData(newData);
      alert(`${selectedBird.name} saved to ${newData.projects[projIdx].name}!`);
      setShowProjectSelector(false);
      setSelectedBird(null);
    }
  };

  const searchBirds = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://nuthatch.lastelm.software/v2/birds?name=${encodeURIComponent(query)}&hasImg=true`, {
        headers: {
          'api-key': NUTHATCH_API_KEY
        }
      });
      
      if (response.status === 401) {
        throw new Error('API Key Required');
      }

      if (!response.ok) throw new Error('Failed to fetch bird data');
      
      const data = await response.json();
      setResults(data.entities || []);
    } catch (err) {
      setError(err.message);
      // Demo results if no key
      setResults([
        { id: 'd1', name: 'American Goldfinch', scientificName: 'Spinus tristis', family: 'Fringillidae', images: ['https://images.unsplash.com/photo-1520699918507-3c3e05c46b0c?auto=format&fit=crop&q=80&w=800'], region: ['North America'], order: 'Passeriformes', genus: 'Spinus' },
        { id: 'd2', name: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis', family: 'Cardinalidae', images: ['https://images.unsplash.com/photo-1549608276-5786d751849a?auto=format&fit=crop&q=80&w=800'], region: ['North America'], order: 'Passeriformes', genus: 'Cardinalis' },
        { id: 'd3', name: 'Blue Jay', scientificName: 'Cyanocitta cristata', family: 'Corvidae', images: ['https://images.unsplash.com/photo-1452570053594-1b985d6ea890?auto=format&fit=crop&q=80&w=800'], region: ['North America'], order: 'Passeriformes', genus: 'Cyanocitta' },
        { id: 'd4', name: 'Snowy Owl', scientificName: 'Bubo scandiacus', family: 'Strigidae', images: ['https://images.unsplash.com/photo-1510137648324-df38ce5ed703?auto=format&fit=crop&q=80&w=800'], region: ['Arctic'], order: 'Strigiformes', genus: 'Bubo' },
        { id: 'd5', name: 'Mallard Duck', scientificName: 'Anas platyrhynchos', family: 'Anatidae', images: ['https://images.unsplash.com/photo-1555529323-8c460d057778?auto=format&fit=crop&q=80&w=800'], region: ['Global'], order: 'Anseriformes', genus: 'Anas' },
        { id: 'd6', name: 'Bald Eagle', scientificName: 'Haliaeetus leucocephalus', family: 'Accipitridae', images: ['https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800'], region: ['North America'], order: 'Accipitriformes', genus: 'Haliaeetus' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto' }} className="fade-in">
      <header className="view-header">
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800 }}>
            <span style={{ background: '#eff6ff', padding: '10px', borderRadius: '14px', display: 'flex' }}><Search size={28} color="var(--primary-blue)" /></span>
            Global Encyclopedia
          </h2>
          <p style={{ color: '#64748b', marginLeft: '60px', marginTop: '4px' }}>Explore thousands of bird species across the planet, powered by Nuthatch API.</p>
        </div>
        <form style={{ maxWidth: '400px', flex: 1 }} onSubmit={searchBirds}>
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, family, or genus..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '44px' }}
            />
          </div>
        </form>
      </header>

      <div style={{ padding: '40px' }}>
        {loading && (
          <div className="bird-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="loading-skeleton" style={{ borderRadius: '20px' }} />)}
          </div>
        )}

        {!loading && (
          <div className="bird-grid">
            {results.map(bird => (
              <div key={bird.id} className="bird-card" onClick={() => setSelectedBird(bird)}>
                <img src={bird.images?.[0] || "/assets/logo.png"} className="bird-img" alt={bird.name} />
                <div className="bird-info">
                  <h3 className="bird-name">{bird.name}</h3>
                  <p className="bird-loc" style={{ fontStyle: 'italic' }}>{bird.scientificName}</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{bird.family}</span>
                    <span style={{ padding: '4px 8px', background: '#eff6ff', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-blue)' }}>{bird.order}</span>
                  </div>
                </div>
              </div>
            ))}
            {results.length === 0 && !loading && !error && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '24px', border: '2.5px dashed #e2e8f0' }}>
                <Search size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <h3 style={{ color: '#94a3b8' }}>Search for any bird species above</h3>
                <p style={{ color: '#cbd5e1' }}>e.g. "Robin", "Eagle", "Hummingbird"...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedBird && (
        <Modal onClose={() => setSelectedBird(null)} title={selectedBird.name}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px' }}>
              {(selectedBird.images || []).map((url, i) => (
                <img key={i} src={url} style={{ height: '350px', width: 'auto', borderRadius: '16px', objectFit: 'cover' }} />
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
               <div className="stat-card" style={{ padding: '16px', borderStyle: 'dashed' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>WINGSPAN</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedBird.wingspanMin ? `${selectedBird.wingspanMin}-${selectedBird.wingspanMax} cm` : 'N/A'}</div>
               </div>
               <div className="stat-card" style={{ padding: '16px', borderStyle: 'dashed' }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 800 }}>LENGTH</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>{selectedBird.lengthMin ? `${selectedBird.lengthMin}-${selectedBird.lengthMax} cm` : 'N/A'}</div>
               </div>
               <div className="stat-card" style={{ padding: '16px', borderStyle: 'dashed', background: selectedBird.status === 'Endangered' ? '#fef2f2' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.65rem', color: selectedBird.status === 'Endangered' ? '#ef4444' : '#94a3b8', fontWeight: 800 }}>STATUS</div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: selectedBird.status === 'Endangered' ? '#ef4444' : 'inherit' }}>{selectedBird.status || 'Secure'}</div>
               </div>
            </div>

            {selectedBird.recordings && selectedBird.recordings.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Volume2 size={18} color="var(--primary-blue)" /> Bird Calls & Recordings
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedBird.recordings.slice(0, 3).map((rec, i) => (
                    <div key={i} style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <audio src={rec.file} controls style={{ height: '32px', flex: 1 }} />
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                        <div style={{ fontWeight: 700 }}>{rec.rec}</div>
                        <div>{rec.length}s</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
               <h4 style={{ marginBottom: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Notebook size={18} color="#8b5cf6" /> Natural History & Biography
               </h4>
               <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#334155', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {wikiLoading ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <div className="loading-skeleton" style={{ height: '20px', marginBottom: '10px' }} />
                      <div className="loading-skeleton" style={{ height: '20px', width: '80%' }} />
                    </div>
                  ) : birdWiki || "No extended biography available for this species."}
               </div>
            </div>

            <div>
               <h4 style={{ marginBottom: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <Info size={18} color="var(--primary-blue)" /> Taxonomy & Distribution
               </h4>
               <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Genus</span>
                     <span style={{ fontWeight: 700 }}>{selectedBird.genus}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Order</span>
                     <span style={{ fontWeight: 700 }}>{selectedBird.order}</span>
                  </li>
                  <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ color: '#64748b', fontWeight: 600 }}>Region</span>
                     <span style={{ fontWeight: 700 }}>{selectedBird.region?.join(', ') || 'N/A'}</span>
                  </li>
               </ul>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button className="primary-btn" style={{ flex: 1 }} onClick={() => setSelectedBird(null)}>Close Entry</button>
              {data.projects.length > 0 && (
                <button 
                  className="nav-item" 
                  style={{ flex: 1, background: '#eff6ff', border: '1.5px solid var(--primary-blue)', fontWeight: 800, color: 'var(--primary-blue)', justifyContent: 'center' }}
                  onClick={() => setShowProjectSelector(true)}
                >
                  <Save size={18} /> Save To...
                </button>
              )}
            </div>

            {showProjectSelector && (
              <div className="project-selector-overlay fade-in">
                <div className="project-selector-modal" onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Choose Project</h3>
                    <button className="icon-btn" onClick={() => setShowProjectSelector(false)}><X size={20} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.projects.map(proj => (
                      <button 
                        key={proj.id} 
                        className="project-selector-item"
                        onClick={() => saveBirdToProject(proj.id)}
                      >
                        <Layers size={18} />
                        <span>{proj.name}</span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

const ANATOMY_SYSTEMS = [
  { name: "Feathers", id: "feathers", img: "/assets/anatomy/feathers.png", color: "#8b5cf6" },
  { name: "Skeletal", id: "skeletal", img: "/assets/anatomy/skeleton.png", color: "#64748b" },
  { name: "Organs", id: "organs", img: "/assets/anatomy/organs.png", color: "#ef4444" }
];

const ANATOMY_DATA = {
  "Feathers": [
    { name: "Crown", text: "The area on the very top of the head along the midline." },
    { name: "Supercilium", text: "A stripe of feathers running from the upper beak and up over the eye, much like an eyebrow." },
    { name: "Auriculars", text: "The feathers just below and behind the eye that cover the ear." },
    { name: "Mantle", text: "The area between the wings on a bird’s back." },
    { name: "Primaries", text: "Stiff feathers on the outer portion (hand) of the wing that generate forward thrust during flight." },
    { name: "Secondaries", text: "Stiff feathers on the inner-middle portion (forearm) of the wing that generate lift during flight." },
    { name: "Tail", text: "A set of stiff feathers at the rear used for steering and braking." }
  ],
  "Skeletal": [
    { name: "Skull", text: "A set of bones that encases the brain; bird skulls are incredibly lightweight." },
    { name: "Furcula", text: "Commonly known as the 'wishbone', it acts like a spring to store energy during flight." },
    { name: "Sternum", text: "Commonly known as the 'breastbone', includes a large keel for flight muscle attachment." },
    { name: "Humerus", text: "The thickest bone of the wing, connecting to the body with a ball-and-socket joint." },
    { name: "Tibiotarsus", text: "Commonly called the 'drumstick' bone; usually the longest leg bone." }
  ],
  "Organs": [
    { name: "Heart", text: "A muscular organ that propels blood; bird heart rates are extremely high during flight." },
    { name: "Lungs", text: "Highly efficient organs that allow for a continuous stream of oxygen-rich air." },
    { name: "Crop", text: "An outpocket of the esophagus used to store food before digestion." },
    { name: "Gizzard", text: "A muscular section of the stomach that works to grind food with the help of grit." }
  ]
};

function BirdAnatomyView() {
  const [activeSystems, setActiveSystems] = useState(["feathers"]);
  const [selectedPart, setSelectedPart] = useState(null);

  const toggleSystem = (id) => {
    setActiveSystems(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', background: '#0f172a', color: 'white' }} className="fade-in">
      {/* Sidebar Controls */}
      <div style={{ width: '320px', background: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Layers size={24} color="#38bdf8" />
            Anatomy Systems
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '8px' }}>Toggle layers to peel away the bird's anatomy.</p>
        </div>
        
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          {ANATOMY_SYSTEMS.map(sys => (
            <div 
              key={sys.id} 
              onClick={() => toggleSystem(sys.id)}
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: activeSystems.includes(sys.id) ? '#334155' : 'transparent',
                border: '1px solid',
                borderColor: activeSystems.includes(sys.id) ? sys.color : '#334155',
                marginBottom: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: sys.color,
                boxShadow: activeSystems.includes(sys.id) ? `0 0 10px ${sys.color}` : 'none'
              }} />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: activeSystems.includes(sys.id) ? 'white' : '#94a3b8' }}>{sys.name}</span>
            </div>
          ))}
        </div>

        {selectedPart && (
          <div style={{ padding: '24px', background: '#0f172a', borderTop: '1px solid #334155' }} className="fade-in">
            <h4 style={{ color: '#38bdf8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Selected Part</h4>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '8px 0' }}>{selectedPart.name}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedPart.text}</p>
            <button 
              onClick={() => setSelectedPart(null)}
              style={{ marginTop: '16px', color: '#64748b', fontSize: '0.8rem', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <X size={14} /> Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Main Interactive Stage */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '900px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Base Layer */}
          <img 
            src="/assets/anatomy/feathers.png" 
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              opacity: activeSystems.includes('feathers') ? 1 : 0.15,
              filter: activeSystems.length > 1 && !activeSystems.includes('feathers') ? 'grayscale(1) brightness(0.7)' : 'none',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'scale(1.15) translateY(-5%)', // Align feathers to match skeleton better
            }} 
          />
          
          {/* Skeleton Layer */}
          <img 
            src="/assets/anatomy/skeleton.png" 
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              opacity: activeSystems.includes('skeletal') ? 1 : 0,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              mixBlendMode: 'screen',
              filter: 'brightness(1.1)'
            }} 
          />

          {/* Organs Layer */}
          <img 
            src="/assets/anatomy/organs.png" 
            style={{ 
              position: 'absolute', 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              opacity: activeSystems.includes('organs') ? 1 : 0,
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              mixBlendMode: 'multiply',
              filter: 'brightness(1.3)'
            }} 
          />
        </div>

        {/* Legend/Instruction at bottom */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', background: 'rgba(30, 41, 59, 0.8)', padding: '12px 24px', borderRadius: '30px', backdropFilter: 'blur(8px)', display: 'flex', gap: '24px', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} /> Feathers
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b' }} /> Skeleton
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Organs
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Info (Prevents covering the picture) */}
      <div style={{ 
        width: '320px', 
        background: '#1e293b', 
        borderLeft: '1px solid #334155', 
        padding: '32px 24px',
        overflowY: 'auto'
      }}>
        <h3 style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>System Records</h3>
        {activeSystems.map(sysId => {
          const system = ANATOMY_SYSTEMS.find(s => s.id === sysId);
          const parts = ANATOMY_DATA[system.name] || [];
          return (
            <div key={sysId} style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '4px', height: '16px', background: system.color, borderRadius: '2px' }} />
                <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 800 }}>{system.name}</h4>
              </div>
              {parts.map(part => (
                <div 
                  key={part.name} 
                  onClick={() => setSelectedPart(part)}
                  style={{
                    padding: '16px',
                    background: selectedPart?.name === part.name ? '#334155' : '#0f172a',
                    borderRadius: '12px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: selectedPart?.name === part.name ? system.color : 'transparent',
                    transition: 'all 0.2s',
                    boxShadow: selectedPart?.name === part.name ? `0 4px 12px rgba(0,0,0,0.2)` : 'none'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: selectedPart?.name === part.name ? 'white' : '#cbd5e1' }}>{part.name}</div>
                  {selectedPart?.name === part.name && (
                    <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }} className="fade-in">{part.text}</p>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
