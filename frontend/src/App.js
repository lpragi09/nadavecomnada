import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DotLoader } from 'react-spinners';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDayTime, setIsDayTime] = useState(true);
  const [coords, setCoords] = useState(null);

  const API_URL = 'http://localhost:5000/weather/full';

  // O fetchWeather está agora em uma função separada para ser chamado por outros eventos
  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError('');
    setWeatherData(null);
    setCoords(null);

    try {
      const response = await axios.get(`${API_URL}/${cityName}`);
      setWeatherData(response.data);
      checkDayTime(response.data.current.dt, response.data.current.timezone);
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

  // A lógica de geolocalização foi movida para dentro do useEffect
  useEffect(() => {
    const fetchGeoLocation = async () => {
      if (navigator.geolocation) {
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              // Chama o backend com as coordenadas, sem expor a API Key
              const response = await axios.get(`${API_URL}/coords?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);

              setWeatherData(response.data);
              setCity(response.data.current.name);
              checkDayTime(response.data.current.dt, response.data.current.timezone);
              setCoords({
                lat: response.data.current.coord.lat,
                lon: response.data.current.coord.lon
              });
            } catch (err) {
              setError('Não foi possível obter sua localização. Por favor, tente buscar uma cidade.');
              setLoading(false);
            }
          },
          () => {
            setError('Permissão de geolocalização negada. Por favor, tente buscar uma cidade.');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocalização não é suportada pelo seu navegador.');
      }
    };

    fetchGeoLocation();
  }, [API_URL]); // Agora o useEffect depende de API_URL

  const checkDayTime = (timestamp, timezone) => {
    const date = new Date((timestamp + timezone) * 1000);
    const hour = date.getUTCHours();
    setIsDayTime(hour > 6 && hour < 18);
  };

  const getForecastForNextDays = (forecastList) => {
    const dailyForecasts = [];
    const uniqueDays = new Set();

    for (const item of forecastList) {
      const date = new Date(item.dt * 1000);
      const day = date.getDate();

      if (uniqueDays.size < 5 && !uniqueDays.has(day)) {
        uniqueDays.add(day);
        dailyForecasts.push(item);
      }
    }

    return dailyForecasts;
  };

  return (
    <div className={`app-container ${isDayTime ? 'day-theme' : 'night-theme'}`}>
      <div className="weather-search">
        <h1>Previsão do Tempo</h1>
        <form onSubmit={(e) => { e.preventDefault(); fetchWeather(city); }}>
          <input
            type="text"
            placeholder="Digite o nome da cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
        <button onClick={() => fetchWeather(city)} className="geolocation-button">Usar minha localização</button>
      </div>

      {loading && (
        <div className="loader-container">
          <DotLoader color={'#fff'} loading={loading} size={60} />
        </div>
      )}

      {error && !loading && <p className="error">{error}</p>}

      {weatherData && !loading && (
        <div className="weather-data">
          {/* Dados do clima atual */}
          <div className="current-weather">
            <h2>{weatherData.current.name}, {weatherData.current.sys.country}</h2>
            <p className="temperature">{weatherData.current.main.temp}°C</p>
            <p className="description">{weatherData.current.weather[0].description}</p>
            <div className="details-grid">
              <div><p>Sensação térmica:</p> <p>{weatherData.current.main.feels_like}°C</p></div>
              <div><p>Umidade:</p> <p>{weatherData.current.main.humidity}%</p></div>
              <div><p>Vento:</p> <p>{weatherData.current.wind.speed} m/s</p></div>
              <div><p>Pressão:</p> <p>{weatherData.current.main.pressure} hPa</p></div>
              <div><p>Visibilidade:</p> <p>{(weatherData.current.visibility / 1000).toFixed(1)} km</p></div>
            </div>
          </div>

          {/* Previsão para os próximos 5 dias */}
          <div className="forecast-container">
            <h3>Previsão para 5 dias</h3>
            <div className="forecast-cards">
              {getForecastForNextDays(weatherData.forecast.list).map((item, index) => (
                <div key={index} className="forecast-card">
                  <p className="forecast-day">{new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                  <img src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`} alt="Ícone do clima" />
                  <p className="forecast-temp">{item.main.temp_max.toFixed(0)}°C</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {coords && !loading && (
        <div className="map-container">
          <iframe
            width="650"
            height="450"
            src={`https://embed.windy.com/embed2.html?lat=${coords.lat}&lon=${coords.lon}&zoom=10&level=surface&overlay=wind&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=m/s&metricTemp=%C2%B0C&radarRange=-1`}
            frameBorder="0"
            title="Mapa do Windy"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default App;