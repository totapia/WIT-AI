import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RouteMapProps {
  className?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  // Set your Mapbox token here
  const MAPBOX_TOKEN = 'pk.eyJ1IjoidG90YXBpYSIsImEiOiJjbWU0djAyeXEwbGt2MnNvbDd1cHFmYXp6In0.0liix0NN5OQKxTUY7tdI2A';

  // Route data with actual coordinates
  const routeData = {
    origin: {
      name: "Los Angeles, CA",
      coordinates: [-118.2437, 34.0522] as [number, number]
    },
    destination: {
      name: "New York, NY", 
      coordinates: [-74.0060, 40.7128] as [number, number]
    }
  };

  const animateRoute = (map: mapboxgl.Map) => {
    // Create route coordinates for animation
    const routeCoordinates = [
      routeData.origin.coordinates,
      [-115.1398, 36.1699], // Las Vegas
      [-111.8910, 40.7608], // Salt Lake City
      [-104.9903, 39.7392], // Denver
      [-94.5786, 39.0997],  // Kansas City
      [-87.6298, 41.8781],  // Chicago
      [-83.0458, 42.3314],  // Detroit
      routeData.destination.coordinates
    ];

    // Add animated route source
    map.addSource('animated-route', {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': []
        }
      }
    });

    // Add route layer with animation
    map.addLayer({
      'id': 'animated-route',
      'type': 'line',
      'source': 'animated-route',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Animate the route drawing
    let step = 0;
    const animateStep = () => {
      if (step < routeCoordinates.length) {
        const currentCoordinates = routeCoordinates.slice(0, step + 1);
        
        (map.getSource('animated-route') as mapboxgl.GeoJSONSource)?.setData({
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': currentCoordinates
          }
        });

        step++;
        setTimeout(animateStep, 500); // 500ms delay between each point
      }
    };

    setTimeout(animateStep, 1000); // Start animation after 1 second
  };

  const initializeMap = () => {
    if (!mapContainer.current) {
      console.error('Map container not found');
      return;
    }

    console.log('Setting mapbox access token');
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      console.log('Creating new map instance');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-101.2, 39.8], // Center of US
        zoom: 3.5,
        pitch: 0
      });
      console.log('Map instance created successfully');
    } catch (error) {
      console.error('Error creating map:', error);
      return;
    }

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      console.log('Map loaded successfully');
      if (!map.current) return;

      // Add origin marker with animation
      const originMarker = new mapboxgl.Marker({ 
        color: '#22c55e',
        scale: 1.2
      })
        .setLngLat(routeData.origin.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>${routeData.origin.name}</strong><br/>Origin Point`)
        )
        .addTo(map.current);

      // Add destination marker with animation
      const destMarker = new mapboxgl.Marker({ 
        color: '#ef4444',
        scale: 1.2
      })
        .setLngLat(routeData.destination.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>${routeData.destination.name}</strong><br/>Destination Point`)
        )
        .addTo(map.current);

      // Start route animation
      animateRoute(map.current);
    });
  };

  useEffect(() => {
    initializeMap();
    
    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className={className}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg" 
        style={{ minHeight: '100%', height: '100%' }}
      />
    </div>
  );
};

export default RouteMap;