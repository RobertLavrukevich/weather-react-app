export async function cityByCoords(lat, lon) {
  const res = await fetch(
    `https://geocode-maps.yandex.ru/v1/?apikey=${import.meta.env.VITE_YANDEX_GEOCODER_KEY}` +
    `&geocode=${lon},${lat}&format=json`
  );
  const json = await res.json();
  const feature = json.response.GeoObjectCollection.featureMember[0];
  if (!feature) throw new Error('Город не найден');

  const components = feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
  const city = components.find(c => c.kind === 'locality')?.name;

  return city || feature.GeoObject.name; 
}

export async function geopositionCity(city) {
  const res = await fetch(
    `https://geocode-maps.yandex.ru/v1/?apikey=${import.meta.env.VITE_YANDEX_GEOCODER_KEY}` +
    `&geocode=${encodeURIComponent(city)}&format=json`
  );
  const json = await res.json();
  const feature = json.response.GeoObjectCollection.featureMember[0];
  if (!feature) throw new Error('Город не найден');
  const [lon, lat] = feature.GeoObject.Point.pos.split(' ');

  const components = feature.GeoObject.metaDataProperty.GeocoderMetaData.Address.Components;
  const cityName = components.find(c => c.kind === 'locality')?.name;

  return { latitude: +lat, longitude: +lon, city: cityName || feature.GeoObject.name };
}
