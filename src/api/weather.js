export async function fetchWeatherByCoords(lat, lon) {
  const res = await fetch(
    `https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}&hours=true`, 
    { headers: { 'X-Yandex-API-Key': "d05ad0cb-361d-4e1a-8c3c-4c43f2b51c44" } }
  );
  if (!res.ok) throw new Error('Ошибка погоды');
  return await res.json();
}
