export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}&hours=true`, 
    { headers: { 'X-Yandex-API-Key': import.meta.env.VITE_YANDEX_WEATHER_KEY } }
  );
  if (!res.ok) throw new Error('Ошибка погоды');
  return await res.json();
}
