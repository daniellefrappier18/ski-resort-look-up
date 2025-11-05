import React from 'react';
import type { SkiResort } from '../types/ski-resort';

interface SkiResortCardProps {
  resort: SkiResort;
}

// Component for handling trail map image loading and fallbacks
function TrailMapImage({ resort }: { resort: SkiResort }) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = `
        <div class="trail-map-placeholder">
          <div class="placeholder-content">
            <span class="placeholder-icon">🗺️</span>
            <span class="placeholder-text">Trail Map<br/>Not Available</span>
          </div>
        </div>
      `;
    }
  };

  // Use the trail_map_url from the data if available
  if (!resort.trail_map_url) {
    return (
      <div className="trail-map-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">🗺️</span>
          <span className="placeholder-text">Trail Map<br/>Not Available</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={resort.trail_map_url}
      alt={`${resort.name} trail map`}
      className="trail-map-image"
      onError={handleImageError}
    />
  );
}

const SkiResortCard: React.FC<SkiResortCardProps> = ({ resort }) => {
  const formatPrice = (price: number) => `$${price}`;
  
  return (
    <div className="ski-resort-card">
      <div className="card-header">
        <h3>{resort.name}</h3>
        <p className="location">{resort.location.city && `${resort.location.city}, `}{resort.location.state}</p>
      </div>

      <div className="card-content">
        <div className="card-main-content">
        <div className="elevation-section">
          <h4>Mountain Stats</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="label">Summit:</span>
              <span className="value">{resort.elevation.summit ? `${resort.elevation.summit.toLocaleString()} ft` : 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Base:</span>
              <span className="value">{resort.elevation.base ? `${resort.elevation.base.toLocaleString()} ft` : 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Vertical:</span>
              <span className="value">{resort.elevation.vertical ? `${resort.elevation.vertical.toLocaleString()} ft` : 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Skiable Acres:</span>
              <span className="value">{resort.skiableAcres !== null && resort.skiableAcres !== undefined ? resort.skiableAcres.toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="lifts-section">
          <h4>Lifts & Trails</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="label">Total Lifts:</span>
              <span className="value">{resort.lifts.total ?? 'N/A'}</span>
            </div>
            <div className="stat">
              <span className="label">Chairlifts:</span>
              <span className="value">{resort.lifts.chairlifts ?? 0}</span>
            </div>
            <div className="stat">
              <span className="label">Surface Lifts:</span>
              <span className="value">{resort.lifts.surfaceLifts ?? 0}</span>
            </div>
            <div className="stat">
              <span className="label">Gondolas/Trams:</span>
              <span className="value">{resort.lifts.gondolas ?? 0}</span>
            </div>
            <div className="stat">
              <span className="label">Funiculars:</span>
              <span className="value">{resort.lifts.funiculars ?? 0}</span>
            </div>
          </div>
          {resort.lifts.fixedGripOnly && (
              <div className="fixed-grip-indicator danger-warning">
                <span className="label">⚠️ WARNING:</span>
                <span className="value fixed-grip">☠️ Fixed-grip only ☠️</span>
              </div>
            )}
        </div>

        <div className="trails-breakdown">
          <h4>Slope Breakdown</h4>
          <div className="total-trails">
            <strong>Total Slopes: {resort.trails.totalKm ? `${resort.trails.totalKm} km` : '0%'}</strong>
          </div>

          <div className="difficulty-bars">
            <div className="difficulty-item">
              <span className="difficulty-label">Beginner</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill beginner"
                  style={{ width: `${((resort.trails.beginnerKm ?? 0) / (resort.trails.totalKm ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">
                {resort.trails.beginnerKm ? `${resort.trails.beginnerKm} km` : '0%'}
                {resort.trails.beginnerKm && resort.trails.totalKm ? ` (${Math.round(((resort.trails.beginnerKm / resort.trails.totalKm) * 100))}%)` : ''}
              </span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Intermediate</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill intermediate"
                  style={{ width: `${((resort.trails.intermediateKm ?? 0) / (resort.trails.totalKm ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">
                {resort.trails.intermediateKm ? `${resort.trails.intermediateKm} km` : '0%'}
                {resort.trails.intermediateKm && resort.trails.totalKm ? ` (${Math.round(((resort.trails.intermediateKm / resort.trails.totalKm) * 100))}%)` : ''}
              </span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Advanced</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill advanced"
                  style={{ width: `${((resort.trails.advancedKm ?? 0) / (resort.trails.totalKm ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">
                {resort.trails.advancedKm ? `${resort.trails.advancedKm} km` : '0%'}
                {resort.trails.advancedKm && resort.trails.totalKm ? ` (${Math.round(((resort.trails.advancedKm / resort.trails.totalKm) * 100))}%)` : ''}
              </span>
            </div>
          </div>
        </div>


        <div className="additional-info">
          {(resort.adult_pass_price || resort.child_pass_price) && (
            <div className="stat">
              <span className="label">Lift Ticket Price(s):</span>
                
                {resort.adult_pass_price && (
                  <span className="value">Adult: {formatPrice(resort.adult_pass_price)}</span>
                )}
                {resort.child_pass_price && (
                  <span className="value"> Child: {formatPrice(resort.child_pass_price)}</span>
                )}
            </div>
          )}
             
          {resort.website && (
            <div className="stat">
              <span className="label">Website:</span>
              <span className="value">
                <a href={resort.website} target="_blank" rel="noopener noreferrer">
                  Visit Site
                </a>
              </span>
            </div>
          )}
          
          
        </div>
        </div>

        <div className="card-thumbnail">
          <div className="trail-map-thumbnail">
            <TrailMapImage resort={resort} />
          </div>
          {resort.trail_map_url && resort.url  && (
            <a 
              href={resort.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="view-full-map"
            >
              View Full Map →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkiResortCard;