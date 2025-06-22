import '../pages/SevenDaysWeather.css'

import '../pages/HomeWeather.css'
import { useEffect, useState } from 'react';
import { fetchWeatherByCoords } from '../api/weather';
import { cityByCoords, geopositionCity } from '../api/geoposition';

const conditionMap = {
  clear: 'Ясно',
  'partly-cloudy': 'Малооблачно',
  cloudy: 'Облачно',
  overcast: 'Пасмурно',
  drizzle: 'Морось',
  'light-rain': 'Небольшой дождь',
  rain: 'Дождь',
  'moderate-rain': 'Умеренный дождь',
  'heavy-rain': 'Сильный дождь',
  showers: 'Ливень',
  'wet-snow': 'Дождь со снегом',
  'light-snow': 'Небольшой снег',
  snow: 'Снег',
  'snow-showers': 'Снегопад',
  hail: 'Град',
  thunderstorm: 'Гроза',
  'thunderstorm-with-rain': 'Дождь с грозой',
  'thunderstorm-with-hail': 'Гроза с градом',
};

export default function SevenDaysForecast() {
  const [forecast, setForecast] = useState([]);
  const [city, setCity] = useState('');
  const [inputCity, setInputCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadForecastByCoords(lat, lon, cityName) {
    try {
      setLoading(true);
      setError('');
      const data = await fetchWeatherByCoords(lat, lon);
      const daily = data.forecasts.map(day => ({
        date: day.date,
        temp_min: day.parts.day.temp_min,
        temp_max: day.parts.day.temp_max,
        humidity: day.parts.day.humidity,
        wind_speed: day.parts.day.wind_speed,
        icon: day.parts.day.icon,
        condition: day.parts.day.condition,
      }));
      setForecast(daily);
      setCity(cityName);
    } catch (e) {
      setError('Ошибка загрузки прогноза');
    } finally {
      setLoading(false);
    }
  }

  async function loadForecastByCity(name) {
    try {
      const { latitude, longitude, city: cityNameFromGeo } = await geopositionCity(name);
      await loadForecastByCoords(latitude, longitude, cityNameFromGeo || name);
    } catch (e) {
      setError(e.message || 'Ошибка при определении координат');
      setForecast([]);
      setCity('');
    }
  }

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const { latitude, longitude } = pos.coords;
          const cityName = await cityByCoords(latitude, longitude);
          await loadForecastByCoords(latitude, longitude, cityName);
        } catch {
          await loadForecastByCity('Minsk');
        }
      },
      () => loadForecastByCity('Minsk')
    );
  }, []);

  return (
    <div className="forecast-container">
      <form className="searchBlock" onSubmit={e => {e.preventDefault();loadForecastByCity(inputCity.trim());}}>
        <div className="group">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="search-icon" viewBox="0 0 16 16">
         <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
         <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z"/>
         </svg>
        <input
          type="search"
          id="query"
          className='inputCity'
          placeholder="Введите город"
          value={inputCity}
          onChange={e => setInputCity(e.target.value)}
        />
        </div>
        <button type="submit" className="full-rounded">
          <span>Найти</span>
          <div className="border full-rounded"></div>
        </button>
      </form>

      {loading && <p className="status-message">Загрузка прогноза...</p>}
      {error && <p className="status-message error">{error}</p>}

      {forecast.length > 0 && (
        <div>
          <h2 className="forecast-title">7-дневный прогноз для города {city}</h2>
          <div className="forecast-grid">
            {forecast.map((day, idx) => (
              <div key={idx} className="forecast-card">
                <h3 className="forecast-date">
                  {new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'long' })}
                  <br />
                  {new Date(day.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                  })}
                </h3>
                <img
                  src={`https://yastatic.net/weather/i/icons/funky/dark/${day.icon}.svg`}
                  alt={day.condition}
                  className="weather-icon"
                />
                <p className="condition">{conditionMap[day.condition] || day.condition}</p>
                <p>Макс: {(day.temp_max > 0 ? '+' : '') + day.temp_max}°</p>
                <p>Мин: {(day.temp_min > 0 ? '+' : '') + day.temp_min}°</p>
                <p>Влажность: {day.humidity}%</p>
                <p>Ветер: {day.wind_speed} м/с</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}