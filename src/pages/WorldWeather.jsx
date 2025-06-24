import '../pages/WorldWeather.css'
import { useEffect, useState } from 'react';

const cities = [
  { name: 'Нью-Йорк', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  { name: 'Лондон', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'Токио', lat: 35.6895, lon: 139.6917, timezone: 'Asia/Tokyo' },
  { name: 'Париж', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Москва', lat: 55.7558, lon: 37.6173, timezone: 'Europe/Moscow' },
  { name: 'Сидней', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Рим', lat: 41.9028, lon: 12.4964, timezone: 'Europe/Rome' },
  { name: 'Стамбул', lat: 41.0082, lon: 28.9784, timezone: 'Europe/Istanbul' },
  { name: 'Дубай', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
  { name: 'Лос-Анджелес', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
  { name: 'Сингапур', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'Барселона', lat: 41.3851, lon: 2.1734, timezone: 'Europe/Madrid' },
];


function translateCondition(condition) {
 const dict = {
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

  return dict[condition] || condition;
}



export default function WorldWeather() {
  const [weatherData, setWeatherData] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await Promise.all(
        cities.map(async (city) => {
          const res = await fetch(
            `https://api.weather.yandex.ru/v2/forecast?lat=${city.lat}&lon=${city.lon}&lang=ru_RU&limit=1`,
            {
              headers: {
                'X-Yandex-API-Key': "d05ad0cb-361d-4e1a-8c3c-4c43f2b51c44",
              },
            }
          );
          const json = await res.json();
          const now = new Date(json.now * 1000).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: city.timezone,
          });

          return {
            name: city.name,
            temp: json.fact.temp,
            condition: json.fact.condition,
            temp_max: json.forecasts[0].parts.day.temp_max,
            temp_min: json.forecasts[0].parts.night.temp_min,
            icon: json.fact.icon,
            time: now,
          };
        })
      );
      setWeatherData(data);
    };

    fetchWeather();
  }, []);

  return (
  <div className="Block">
  {weatherData.map((city) => (
    <div key={city.name} className="cityWeather">
      <div className="cityInfo">
        <img
          src={`https://yastatic.net/weather/i/icons/funky/dark/${city.icon}.svg`}
          alt={city.condition}
        />
        <div className="weatherText">
          <span className="font-semibold">{city.name}</span>
          <span>{translateCondition(city.condition)}. High: {city.temp_max}° Low: {city.temp_min}°</span>
          <span className="">Локальное время: {city.time}</span>
        </div>
      </div>
      <div className="cityTemp">{city.temp}°</div>

    </div>
  ))}
</div>

  );
}