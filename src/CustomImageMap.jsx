import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, Save, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function CustomImageMap({ imageUrl, onSave, initialMarkers = [] }) {
  const [markers, setMarkers] = useState(initialMarkers);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const containerRef = useRef(null);

  const handleImageClick = (e) => {
    if (!isAddingPin) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const label = prompt('Enter a label for this pin:', 'Favorite Spot');
    if (label) {
      setMarkers([...markers, { id: uuidv4(), x, y, label }]);
    }
    setIsAddingPin(false);
  };

  const removeMarker = (id) => {
    setMarkers(markers.filter(m => m.id !== id));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2>Map View: Interactive Mode</h2>
          <p style={{ color: '#64748b' }}>Click anywhere on your uploaded map to add labels and memories.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`primary-btn ${isAddingPin ? 'active' : ''}`} 
            onClick={() => setIsAddingPin(!isAddingPin)}
            style={{ backgroundColor: isAddingPin ? '#ef4444' : 'var(--primary-blue)' }}
          >
            {isAddingPin ? <X size={18} /> : <Plus size={18} />}
            {isAddingPin ? 'Cancel' : 'Add Pin'}
          </button>
          <button className="primary-btn" onClick={() => onSave(markers)}>
            <Save size={18} /> Save Map Pins
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          position: 'relative', 
          backgroundColor: '#000', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: isAddingPin ? 'crosshair' : 'default'
        }}
        onClick={handleImageClick}
      >
        <img 
          src={imageUrl} 
          style={{ maxWidth: '100%', maxHeight: '100%', userSelect: 'none' }} 
          draggable="false"
        />
        
        {markers.map((pin) => (
          <div 
            key={pin.id}
            style={{ 
              position: 'absolute', 
              left: `${pin.x}%`, 
              top: `${pin.y}%`, 
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: 10
            }}
            title={pin.label}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ 
                 background: 'white', 
                 padding: '4px 10px', 
                 borderRadius: '6px', 
                 fontSize: '0.75rem', 
                 fontWeight: 700, 
                 boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                 marginBottom: '4px',
                 whiteSpace: 'nowrap',
                 color: 'var(--text-main)',
                 border: '1.5px solid var(--primary-blue)'
               }}>
                 {pin.label}
               </div>
               <MapPin size={24} color="#ef4444" fill="#ef4444" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
               <button 
                 onClick={(e) => { e.stopPropagation(); removeMarker(pin.id); }}
                 style={{ 
                   position: 'absolute', 
                   top: '-20px', 
                   right: '-20px', 
                   background: '#ef4444', 
                   color: 'white', 
                   borderRadius: '50%', 
                   width: '18px', 
                   height: '18px', 
                   fontSize: '10px', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center' 
                 }}
               >
                 <X size={10} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomImageMap;
