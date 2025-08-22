import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Weather from './components/components/Weather';
import News from './components/components/News';
import Radar from './components/components/Radar';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState(null);

  const API_URL = 'https://nadavecomnada.onrender.com/weather/full';

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    setWeatherData(null);
    setCoords(null);

    try {
      const response = await axios.get(`${API_URL}/${cityName}`);
      setWeatherData(response.data);
      setCoords({
        lat: response.data.current.coord.lat,
        lon: response.data.current.coord.lon
      });
    } catch (err) {
      setError('Não foi possível encontrar o clima para essa cidade. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGeoLocation = useCallback(async () => {
    setLoading(true);
    setError('');
    setWeatherData(null);
    setCoords(null);
    try {
      const geoResponse = await axios.get('https://ipapi.co/json/');
      
      const { latitude, longitude, city: ipCity } = geoResponse.data;
      
      const response = await axios.get(`${API_URL}/${ipCity}`);
      
      setWeatherData(response.data);
      setCity(ipCity);
      setCoords({ lat: latitude, lon: longitude });
      
    } catch (err) {
      setError('Não foi possível obter sua localização automaticamente. Tente buscar uma cidade.');
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchGeoLocation();
  }, [fetchGeoLocation]);

  const getWeatherTheme = () => {
    if (!weatherData) return 'weather-default';
    const mainWeather = weatherData.current.weather[0].main.toLowerCase();
    switch (mainWeather) {
      case 'clear':
        return 'weather-clear';
      case 'clouds':
        return 'weather-clouds';
      case 'rain':
        return 'weather-rain';
      case 'drizzle':
        return 'weather-rain';
      case 'thunderstorm':
        return 'weather-thunderstorm';
      case 'snow':
        return 'weather-snow';
      default:
        return 'weather-default';
    }
  };

  return (
    <Router>
      <div className={`app-container ${getWeatherTheme()}`}>
        <Navbar weatherData={weatherData} />
        <div className="content">
          <Routes>
            <Route path="/" element={<Weather 
              weatherData={weatherData}
              loading={loading}
              error={error}
              city={city}
              setCity={setCity}
              fetchWeather={fetchWeather}
              fetchGeoLocation={fetchGeoLocation}
            />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/radar" element={<Radar coords={coords} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;