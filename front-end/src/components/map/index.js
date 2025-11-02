// Map Components Export
export { MapContainer, useGoogleMaps } from './MapContainer';
export { LeafletMap } from './LeafletMap';
export { GoogleMap } from './GoogleMap';
export { SmartMap } from './SmartMap';
export { VehicleTracker, VehicleDetails } from './VehicleTracker';
export { RouteMap, RouteStats } from './RouteMap';

// NOTE: Removed TypeScript interfaces below ✅
// If you still need documentation, consider converting them into JSDoc:
/**
 * @typedef {Object} MapMarker
 * @property {string} id
 * @property {{ lat: number, lng: number }} position
 * @property {string} title
 * @property {'bus' | 'stop' | 'school' | 'home' | 'incident'} type
 * @property {string} [icon]
 * @property {string} [info]
 * @property {'active' | 'inactive' | 'warning' | 'danger'} [status]
 */

/**
 * @typedef {Object} MapRoute
 * @property {string} id
 * @property {{ lat: number, lng: number }[]} path
 * @property {string} color
 * @property {number} [strokeWeight]
 * @property {string} title
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} id
 * @property {string} licensePlate
 * @property {string} driverName
 * @property {string} route
 * @property {{ lat: number, lng: number }} position
 * @property {number} speed
 * @property {'active' | 'stopped' | 'maintenance' | 'incident'} status
 * @property {string} lastUpdate
 * @property {number} studentsOnBoard
 * @property {number} totalCapacity
 * @property {number} fuel
 * @property {number} temperature
 * @property {string} nextStop
 * @property {string} estimatedArrival
 */

/**
 * @typedef {Object} BusStop
 * @property {string} id
 * @property {string} name
 * @property {{ lat: number, lng: number }} position
 * @property {'school' | 'regular' | 'home'} type
 * @property {number} studentsCount
 * @property {string} arrivalTime
 * @property {string} departureTime
 */

/**
 * @typedef {Object} RouteData
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} color
 * @property {BusStop[]} stops
 * @property {{ lat: number, lng: number }[]} path
 * @property {number} totalDistance
 * @property {number} estimatedDuration
 * @property {number} activeVehicles
 */
