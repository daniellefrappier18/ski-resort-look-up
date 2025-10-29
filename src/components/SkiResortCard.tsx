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
              <span className="value">{resort.elevation.summit.toLocaleString()} ft</span>
            </div>
            <div className="stat">
              <span className="label">Base:</span>
              <span className="value">{resort.elevation.base.toLocaleString()} ft</span>
            </div>
            <div className="stat">
              <span className="label">Vertical:</span>
              <span className="value">{resort.elevation.vertical.toLocaleString()} ft</span>
            </div>
            <div className="stat">
              <span className="label">Skiable Acres:</span>
              <span className="value">{resort.skiableAcres.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="lifts-section">
          <h4>Lifts & Trails</h4>
          <div className="stats-grid">
            <div className="stat">
              <span className="label">Total Lifts:</span>
              <span className="value">{resort.lifts.total}</span>
            </div>
            <div className="stat">
              <span className="label">Chairlifts:</span>
              <span className="value">{resort.lifts.chairlifts}</span>
            </div>
            {resort.lifts.gondolas && (
              <div className="stat">
                <span className="label">Gondolas:</span>
                <span className="value">{resort.lifts.gondolas}</span>
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
                  style={{ width: `${(resort.trails.beginner / resort.trails.total) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.beginner}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Intermediate</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill intermediate"
                  style={{ width: `${(resort.trails.intermediate / resort.trails.total) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.intermediate}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Advanced</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill advanced"
                  style={{ width: `${(resort.trails.advanced / resort.trails.total) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.advanced}</span>
            </div>
            <div className="difficulty-item">
              <span className="difficulty-label">Expert</span>
              <div className="difficulty-bar">
                <div 
                  className="difficulty-fill expert"
                  style={{ width: `${(resort.trails.expert / resort.trails.total) * 100}%` }}
                ></div>
              </div>
              <span className="difficulty-count">{resort.trails.expert}</span>
            </div>
          </div>
        </div>

        <div className="additional-info">
          <div className="stat">
            <span className="label">Snowmaking:</span>
            <span className="value">{resort.snowmaking.percentage}% of trails</span>
          </div>
          {resort.liftTicketPrice && (
            <div className="stat">
              <span className="label">Adult Lift Ticket:</span>
              <span className="value">{formatPrice(resort.liftTicketPrice.adult)}</span>
            </div>
          )}
        </div>

        {resort.description && (
          <div className="description">
            <p>{resort.description}</p>
          </div>
        )}
      </div>

      <div className="card-footer">
        {resort.website && (
          <a 
            href={resort.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="website-link"
          >
            Visit Website
          </a>
        )}
      </div>
    </div>
  );
};

export default SkiResortCard;