import React from 'react';
import type { SkiResort } from '../types/ski-resort';

interface SkiResortCardProps {
  resort: SkiResort;
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
            {resort.lifts.fixedGripOnly && (
              <div className="stat fixed-grip-indicator">
                <span className="label">Lift Type:</span>
                <span className="value fixed-grip">Fixed-grip only</span>
              </div>
            )}
            <div className="stat">
              <span className="label">Total Trails:</span>
              <span className="value">{resort.trails.total}</span>
            </div>
          </div>
        </div>

        <div className="trails-breakdown">
          <h4>Trail Difficulty</h4>
          <div className="difficulty-bars">
            <div className="difficulty-item">
              <span className="difficulty-label">Beginner</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill beginner"
                  style={{ width: `${((resort.trails.beginner ?? 0) / (resort.trails.total ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.beginner}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Intermediate</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill intermediate"
                  style={{ width: `${((resort.trails.intermediate ?? 0) / (resort.trails.total ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.intermediate}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Advanced</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill advanced"
                  style={{ width: `${((resort.trails.advanced ?? 0) / (resort.trails.total ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.advanced}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Expert</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill expert"
                  style={{ width: `${((resort.trails.expert ?? 0) / (resort.trails.total ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.expert}</span>
            </div>
          </div>
        </div>


        <div className="additional-info">
          {resort.liftTicketPrice && (
            <div className="stat">
              <span className="label">Lift Ticket:</span>
              <span className="value">{formatPrice(resort.liftTicketPrice)}</span>
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
          
          {resort.phoneNumber && (
            <div className="stat">
              <span className="label">Phone:</span>
              <span className="value">
                <a href={`tel:${resort.phoneNumber}`}>{resort.phoneNumber}</a>
              </span>
            </div>
          )}
          
          {resort.seasonDates && (
            <div className="stat">
              <span className="label">Season:</span>
              <span className="value">{resort.seasonDates}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkiResortCard;