// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

const API_KEY = process.env.OPENWEATHER_API_KEY;

// Endpoint para buscar clima e previsão por nome de cidade
app.get('/weather/full/:city', async (req, res) => {
  const city = req.params.city;
  const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`;
  const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const [currentWeatherRes, forecastRes] = await Promise.all([
      axios.get(urlCurrent),
      axios.get(urlForecast)
    ]);

    res.json({
      current: currentWeatherRes.data,
      forecast: forecastRes.data
    });
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        res.status(404).json({ message: 'Cidade não encontrada.' });
      } else {
        res.status(error.response.status).json({ message: 'Erro ao buscar dados.' });
      }
    } else {
      res.status(500).json({ message: 'Erro no servidor.' });
    }
  }
});

// NOVO ENDPOINT para buscar clima e previsão por coordenadas
app.get('/weather/full/coords', async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  // Adicione este log para ver o que o backend recebeu
  console.log('Backend recebeu coordenadas:', lat, lon);

  const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
  const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  // ... (restante do código)

  try {
    const [currentWeatherRes, forecastRes] = await Promise.all([
      axios.get(urlCurrent),
      axios.get(urlForecast)
    ]);

    res.json({
      current: currentWeatherRes.data,
      forecast: forecastRes.data
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao obter dados de geolocalização.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});