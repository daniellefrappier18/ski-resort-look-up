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
        <div class="w-full h-full flex items-center justify-center text-gray-500" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef)">
          <div class="text-center">
            <span class="text-3xl block mb-2">🗺️</span>
            <span class="text-xs leading-tight">Trail Map<br/>Not Available</span>
          </div>
        </div>
      `;
    }
  };

  // Use the trail_map_url from the data if available
  if (!resort.trail_map_url || resort.trail_map_url.includes('adserver')) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500" style={{background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'}}>
        <div className="text-center">
          <span className="text-3xl block mb-2">🗺️</span>
          <span className="text-xs leading-tight">Trail Map<br/>Not Available</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={resort.trail_map_url}
      alt={`${resort.name} trail map`}
      className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
      onError={handleImageError}
    />
  );
}

const SkiResortCard: React.FC<SkiResortCardProps> = ({ resort }) => {
  const formatPrice = (price: number) => `$${price}`;
  
  return (
    <article 
      className="bg-white border border-gray-300 rounded-lg p-6 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
      role="listitem"
      aria-labelledby={`resort-${resort.id}`}
    >
      <header className="card-header">
        <h3 id={`resort-${resort.id}`} className="text-resort-blue m-0 mb-1 text-xl">{resort.name}</h3>
        <p className="text-gray-600 m-0 mb-4 italic">{resort.location.city && `${resort.location.city}, `}{resort.location.state}</p>
      </header>

      <div className="block md:flex gap-6 items-start">
        <div className="flex-1 w-full">
        <section className="elevation-section" aria-labelledby={`stats-${resort.id}`}>
          <h4 id={`stats-${resort.id}`} className="text-gray-800 mt-4 mb-2 text-base border-b border-gray-200 pb-1">Mountain Stats</h4>
          <div className="grid gap-2 mb-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'}}>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Summit:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.elevation.summit ? `${resort.elevation.summit.toLocaleString()} ft` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Base:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.elevation.base ? `${resort.elevation.base.toLocaleString()} ft` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Vertical:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.elevation.vertical ? `${resort.elevation.vertical.toLocaleString()} ft` : 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Skiable Acres:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.skiableAcres !== null && resort.skiableAcres !== undefined ? resort.skiableAcres.toLocaleString() : 'N/A'}</span>
            </div>
          </div>
        </section>

        <section className="lifts-section" aria-labelledby={`lifts-${resort.id}`}>
          <h4 id={`lifts-${resort.id}`} className="text-gray-800 mt-4 mb-2 text-base border-b border-gray-200 pb-1">Lifts & Trails</h4>
          <div className="grid gap-2 mb-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'}}>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Total Lifts:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.lifts.total ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Chairlifts:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.lifts.chairlifts ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Surface Lifts:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.lifts.surfaceLifts ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Gondolas/Trams:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.lifts.gondolas ?? 0}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Funiculars:</span>
              <span className="font-semibold text-gray-800 text-xs">{resort.lifts.funiculars ?? 0}</span>
            </div>
          </div>
          {resort.lifts.fixedGripOnly && (
              <div className="col-span-2 rounded-lg p-2 animate-danger-pulse" style={{background: 'linear-gradient(45deg, #ff4444, #cc0000)', border: '2px solid #990000'}}>
                <div className="text-white font-bold" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>⚠️ WARNING:</div>
                <div className="text-white px-2 py-1 rounded-xl text-xs font-bold border border-red-800 mt-2" style={{background: 'linear-gradient(45deg, #ff6b6b, #ff4757)', textShadow: '1px 1px 2px rgba(0,0,0,0.8)'}}>☠️ Fixed-grip only ☠️</div>
              </div>
            )}
        </section>

        <section className="trails-breakdown" aria-labelledby={`trails-${resort.id}`}>
          <h4 id={`trails-${resort.id}`} className="text-gray-800 mt-4 mb-2 text-base border-b border-gray-200 pb-1">Slope Breakdown</h4>
          <div className="font-bold mb-2">
            <strong>Total Slopes: {resort.trails.totalKm ? `${resort.trails.totalKm} km` : '0%'}</strong>
          </div>

          <div className="mt-2">
            <div className="flex items-center mb-2 gap-2">
              <span className="text-xs min-w-24 text-gray-600">Beginner <span className="text-beginner">●</span></span>
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 bg-difficulty-beginner"
                  style={{ width: `${((resort.trails.beginnerKm ?? 0) / (resort.trails.totalKm ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold min-w-6 text-right text-gray-800">
                {resort.trails.beginnerKm ? `${resort.trails.beginnerKm} km` : '0%'}
                {resort.trails.beginnerKm && resort.trails.totalKm ? ` (${Math.round(((resort.trails.beginnerKm / resort.trails.totalKm) * 100))}%)` : ''}
              </span>
            </div>
            <div className="flex items-center mb-2 gap-2">
              <span className="text-xs min-w-24 text-gray-600">Intermediate <span className="text-intermediate">■</span></span>
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 bg-difficulty-intermediate"
                  style={{ width: `${((resort.trails.intermediateKm ?? 0) / (resort.trails.totalKm ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold min-w-6 text-right text-gray-800">
                {resort.trails.intermediateKm ? `${resort.trails.intermediateKm} km` : '0%'}
                {resort.trails.intermediateKm && resort.trails.totalKm ? ` (${Math.round(((resort.trails.intermediateKm / resort.trails.totalKm) * 100))}%)` : ''}
              </span>
            </div>
            <div className="flex items-center mb-2 gap-2">
              <span className="text-xs min-w-24 text-gray-600">Advanced <span className="text-advanced">◆</span></span>
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 bg-difficulty-advanced"
                  style={{ width: `${((resort.trails.advancedKm ?? 0) / (resort.trails.totalKm ?? 1)) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs font-semibold min-w-6 text-right text-gray-800">
                {resort.trails.advancedKm ? `${resort.trails.advancedKm} km` : '0%'}
                {resort.trails.advancedKm && resort.trails.totalKm ? ` (${Math.round(((resort.trails.advancedKm / resort.trails.totalKm) * 100))}%)` : ''}
              </span>
            </div>
          </div>
        </section>


        <section className="pricing-section" aria-labelledby={`pricing-${resort.id}`}>
          <h4 id={`pricing-${resort.id}`} className="sr-only">Pricing and Website</h4>
          <div className="mt-4 pt-4 border-t border-gray-200">
          {(resort.adult_pass_price || resort.child_pass_price) && (
            <div className="py-1">
              <span className="text-xs text-gray-600">Lift Ticket Price(s):</span>
                <div className="flex justify-between items-center">
                {resort.adult_pass_price && (
                  <span className="font-semibold text-gray-800 text-xs">Adult: {formatPrice(resort.adult_pass_price)}</span>
                )}
                {resort.child_pass_price && (
                  <span className="font-semibold text-gray-800 text-xs"> Child: {formatPrice(resort.child_pass_price)}</span>
                )}
                </div>
            </div>
          )}
             
          {resort.website && (
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600">Website:</span>
              <span className="font-semibold text-gray-800 text-xs">
                <a href={resort.website} target="_blank" rel="noopener noreferrer" className="text-resort-blue hover:text-resort-blue-hover">
                  Visit Site
                </a>
              </span>
            </div>
          )}
          </div>
        </section>
        </div>

        <aside className="w-48 flex-shrink-0 flex flex-col gap-2" aria-labelledby={`map-${resort.id}`}>
          <h4 id={`map-${resort.id}`} className="sr-only">Trail Map</h4>
          <div className="w-full h-36 border-2 border-gray-300 rounded-lg overflow-hidden relative bg-gray-100">
            <TrailMapImage resort={resort} />
          </div>
          {resort.url && resort.trail_map_url && (
            <a 
              href={resort.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-resort-blue no-underline text-xs font-medium text-center py-1 border border-resort-blue rounded transition-all duration-200 hover:bg-resort-blue hover:text-white"
              aria-label={`View full trail map for ${resort.name}`}
            >
              View Full Map →
            </a>
          )}
        </aside>
      </div>
    </article>
  );
};

export default SkiResortCard;