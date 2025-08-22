import React from 'react';
import './Radar.css';

const Radar = ({ coords }) => {
    return (
        <div className="map-container">
            {coords && (
                <iframe
                    width="650"
                    height="450"
                    src={`https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lon}&zoom=10&level=surface&overlay=wind&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=m/s&metricTemp=%C2%B0C&radarRange=-1`}
                    frameBorder="0"
                    title="Mapa do Windy"
                ></iframe>
            )}
            {!coords && <p>Carregando mapa...</p>}
        </div>
    );
};

export default Radar;