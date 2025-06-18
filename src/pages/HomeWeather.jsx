import React, { useState, useEffect } from 'react';
import { geopositionCity, cityByCoords } from '../api/geoposition';
import { fetchWeatherByCoords } from '../api/weather';
import '../pages/HomeWeather.css'

export default function HomeWeather() {
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

  const windDir = {
    w: 'З',
    e: 'В',
    s: 'Ю',
    n: 'С',
    sw:'ЮЗ',
    nw: 'СЗ',
    se:'ЮВ',
    ne:'СВ',
    c:'Штиль'   
}
  const [current, setCurrent] = useState(null);
  const [visible, setVisible] = useState([]);
  const [city, setCity] = useState('');
  const [inputCity, setInputCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadByCoords(lat, lon, cityName) {
    setError('');
  setLoading(true);
  try {
    const data = await fetchWeatherByCoords(lat, lon);


    const { fact } = data;
    const { sunrise, sunset } = data.forecasts[0] || {};
    
    setCurrent({
      ...fact,
      sunrise,
      sunset
    });


    //setCurrent(data.fact);


    
    if (cityName) setCity(cityName);

    const today = data.forecasts[0]?.hours.map(h => ({ ...h, day: 0 })) || [];
    const tomorrow = data.forecasts[1]?.hours.map(h => ({ ...h, day: 1 })) || [];

    const now = new Date();
    now.setMinutes(0, 0, 0);

    const fullHours = [...today, ...tomorrow].map(item => {
      const forecastDate = new Date(data.forecasts[item.day].date);
      forecastDate.setHours(item.hour, 0, 0, 0);
      return {
        
        ...item,
        fullDate: forecastDate
      };
    });

    const nextHours = fullHours.filter(h => h.fullDate >= now).slice(0, 32);
    setVisible(nextHours);
  } catch {
    setError('Ошибка загрузки данных');
  } finally {
    setLoading(false);
  }
  }

  async function loadByCityName(name) {
    setError('');
    setLoading(true);
    try {
      const { latitude, longitude, city: cityNameFromGeo } = await geopositionCity(name);
      await loadByCoords(latitude, longitude, cityNameFromGeo || name);
    } catch (e) {
      setError(e.message);

      setCurrent(null);
    setVisible([]);
    setCity('');
    
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        try {
          const cityName = await cityByCoords(latitude, longitude);
          await loadByCoords(latitude, longitude, cityName);
        } catch {
          await loadByCityName('Minsk');
        }
      },
      () => loadByCityName('Minsk')
    );
  }, []);

  if (loading) return <div className='loadingInfo'>Загрузка...</div>;
  //if (error) return <div className='errorText'>{error}</div>;
  //if (!current) return null;

          function formatTime(timeStr) {
          const [hour, minute] = timeStr.split(':');
          return `${hour}:${minute}`;
        }

  return (
    <div className='mainBlock'>

      <form className="searchBlock" onSubmit={e => { e.preventDefault(); loadByCityName(inputCity.trim()); }}>
        <div class="group">
         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="search-icon" viewBox="0 0 16 16">
         <path d="M14.763.075A.5.5 0 0 1 15 .5v15a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V14h-1v1.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V10a.5.5 0 0 1 .342-.474L6 7.64V4.5a.5.5 0 0 1 .276-.447l8-4a.5.5 0 0 1 .487.022M6 8.694 1 10.36V15h5zM7 15h2v-1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5V15h2V1.309l-7 3.5z"/>
         <path d="M2 11h1v1H2zm2 0h1v1H4zm-2 2h1v1H2zm2 0h1v1H4zm4-4h1v1H8zm2 0h1v1h-1zm-2 2h1v1H8zm2 0h1v1h-1zm2-2h1v1h-1zm0 2h1v1h-1zM8 7h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zM8 5h1v1H8zm2 0h1v1h-1zm2 0h1v1h-1zm0-2h1v1h-1z"/>
         </svg>

          <input
            id="query"
            className='inputCity'
            type="search"
            placeholder="Введите город"
            name="searchbar"
            value={inputCity}
            onChange={e => setInputCity(e.target.value)}
          />
        </div>
        <button class="full-rounded" type="submit">
          <span>Найти</span>
          <div class="border full-rounded"></div>
        </button>
      </form>
    
      {loading && <div className='loadingInfo'>Загрузка...</div>}
      {error && ( <div className='errorText'>{error}</div>)}
      {current && (

      <div className='mainInfo'>
      <h1>Погода в городе {city}</h1>

      <div className="current-weather">
        <h2 className='currentTemp'>{(current.temp > 0 ? "+" : "") + current.temp + "°"} — 
        <img className='currentCondition' src={`https://yastatic.net/weather/i/icons/funky/dark/${current.icon}.svg`} alt={current.condition}/>
         {(conditionMap[current.condition] || current.condition)}</h2>
        <p>Ощущается как: {(current.feels_like > 0 ? "+" : "") + current.feels_like + "°"}</p>
        <div className='windInfo blockInfo'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-wind" viewBox="0 0 16 16">
            <path d="M12.5 2A2.5 2.5 0 0 0 10 4.5a.5.5 0 0 1-1 0A3.5 3.5 0 1 1 12.5 8H.5a.5.5 0 0 1 0-1h12a2.5 2.5 0 0 0 0-5m-7 1a1 1 0 0 0-1 1 .5.5 0 0 1-1 0 2 2 0 1 1 2 2h-5a.5.5 0 0 1 0-1h5a1 1 0 0 0 0-2M0 9.5A.5.5 0 0 1 .5 9h10.042a3 3 0 1 1-3 3 .5.5 0 0 1 1 0 2 2 0 1 0 2-2H.5a.5.5 0 0 1-.5-.5"/>
            </svg><p>Ветер: {current.wind_speed} м/с, Направление ветра: {(windDir[current.wind_dir] || current.wind_dir)}</p>
        </div>

        <div className='pressureInfo blockInfo'>
            <svg class="style_icon__utnVg AppFact_details__icon__d7iOt" role="presentation" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none"><path d="M.5 8a7.5 7.5 0 1 1 0 .001zm6.5 0a1 1 0 1 1 0 .001zm-1 2l5.8-5.8m-2.5 0h2.5v2.5"></path></svg>
            <p>Давление: {current.pressure_mm} мм</p>
        </div>

        <div className='humidityInfo blockInfo'>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-moisture" viewBox="0 0 16 16">
            <path d="M13.5 0a.5.5 0 0 0 0 1H15v2.75h-.5a.5.5 0 0 0 0 1h.5V7.5h-1.5a.5.5 0 0 0 0 1H15v2.75h-.5a.5.5 0 0 0 0 1h.5V15h-1.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 .5-.5V.5a.5.5 0 0 0-.5-.5zM7 1.5l.364-.343a.5.5 0 0 0-.728 0l-.002.002-.006.007-.022.023-.08.088a29 29 0 0 0-1.274 1.517c-.769.983-1.714 2.325-2.385 3.727C2.368 7.564 2 8.682 2 9.733 2 12.614 4.212 15 7 15s5-2.386 5-5.267c0-1.05-.368-2.169-.867-3.212-.671-1.402-1.616-2.744-2.385-3.727a29 29 0 0 0-1.354-1.605l-.022-.023-.006-.007-.002-.001zm0 0-.364-.343zm-.016.766L7 2.247l.016.019c.24.274.572.667.944 1.144.611.781 1.32 1.776 1.901 2.827H4.14c.58-1.051 1.29-2.046 1.9-2.827.373-.477.706-.87.945-1.144zM3 9.733c0-.755.244-1.612.638-2.496h6.724c.395.884.638 1.741.638 2.496C11 12.117 9.182 14 7 14s-4-1.883-4-4.267"/>
            </svg><p>Влажность {current.humidity}%</p>
        </div>

        <div className='uvInfo blockInfo'>                
            <svg className='uv'
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 23 23"
              fill="none"
              stroke="#000000"
              stroke-width="1.25"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M3 12h1m16 0h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7m-9.7 5.7a4 4 0 1 1 8 0" />
              <path d="M12 4v-1" />
              <path d="M13 16l2 5h1l2 -5" />
              <path d="M6 16v3a2 2 0 1 0 4 0v-3" />
            </svg>
            <p>УФ‑индекс: {current.uv_index != null ? current.uv_index : '—'}</p>
        </div>
        <div className='riceset'>
            <img src="https://yandex-pogoda.static-storage.net/A14o99S70/43fc06bm/07J3rYnfh3OtRyAFpQYS_8kduCPPd2FI7Bfwu-jgGnuNwF73snomr5S4aAZ-T6jZ44UCqQdUj09VonskwtUXU3PCFuve2WTxn4STNnfktP65XByS7qORKT-1IEhM4ptpj6J4dvCotr9kCaqFWM0KS_PzIrv38O-fJ8HaJAM1FLezsHYZrIkkkr90Upb0x4Qsub590Fyl0lov1BbrHnCa-5yhm0TgmYbcZMlINarNqAjwo1ELBgN9HGbzK1bTlTTXYgIF2Fw7RtAe5lA2JwTmbfuMDeDuFTAoj-Q36E0jussscXkVMwukP9Q7qbfpn2q4YxOjKCZBPz-WgimFg_SFVwPydcusCPaT3-aiNFe1NW5J3lwD7oTQm1zEpukOcqt7PRELdrH6B13FyGvlqNy4CABzwXrVsq1ONcDYloEHRPSCsgbIf0mWwBzm0jXmxvbeaz1sAq51UvoNNmQLvbCbKE3jyuXTy9ecJmgqNFgeu1nyIPK45VEvvAYxyoVxRObEghL3mo87p7Md1PD39Jb1Deg8bDP9BFJ7fhWF2T2xiOntElhVMrqF7BSYGHer_NoYEwBy-WQx3k5n02tmEnSHJbAQRZssOgTzz0SiB3UHpDwZ3J1CH7chO260NMuu86rYP4EIdcJY1UylqVg0GI_6CvBg4UsnEC6uJBH7NXGEhfTT8aQ5rzrV8y82EDVH1YRfu8-88Gwn8mo_ZCSo_qHIGU0S6xfCa7at1ggY1Xp_WKqCUQPaBoD97TTTyXezRtc081A3m0wodvF9FQC3ZJWEXqrMP1IsJgOoPiY3S21gyXhfEltHQ-u0fAWI6WY4XPgIkCNRK2Xy7I-FocgFU9Un9zPCJsidWufxfFTyJvblJN4p_q_j_wZCGB5mpUldgCrabfPbBLG61q6EmNi3ae1pS6PC89o0Mh8MFqEZh6FnVyUiMmcYv4glg30nckQFB6Rdyd_t0c4EQhp-lqbo7HI4KZ-gWMYSSaVd1csLxCifyrgiIMKKd5BPHCexeqQQBGclUBEEqD-q5JLNZiOEVATWbeov7gIOV7M7PRfkGjwgyyguInjVI7pVrWbq6JWYT7ub0VFCGvWSnV5EgyhGECa0tfHSZ-kOiTSxzzZwRMUWFk5JfC4yTCYw-I_GJ0kNYAsa3mOYRyO7ht9GWZvXe99ouEKxQYiEYO5_VpCaNUC3FEbyo4TbfmoVwZ9mAGV31KcuCV39Uj9U4tpPdvYJH4BaK23BqqXiq7e-pXi7xnhMi9mgopNKxWE9THRi62YyNSVUk5InuMyoZ-F_FCF398alb-n9XAPMRgDInmQGuv1we2vvkyi0gLumrTRpCHRpjwn4gaHDGccT_L9UEUsmkQUG9RHSBKgfCgeynOVztgdXpJw5n2ywrhXSavyVhAseIihYDkBYJJCoR620qBnEaJzJilAQs_kWQl48FXE4dRN1BjbgUyRqHAs1k-9XcgZFhsRNq43OQI608mhO90aK3FOZSA3RWlSwK0Z_Jpt7hVps-Dmh0wPKNDE8vveR2GQANITnINH2iX-JFhDd50Bmx9SEXhvfvlIt5eFLDmVEmf5wOWoOAMsGE_m2r4TIC0dofKoZw-DwqXdCHn5kIuqlA1V1ZRNg5Fi9y6VgLuZC5GWHV71Y7C-T_9ZSqD7nxOm88pnpDjAJR-Ka95-2eUqGCjxL2pFjM_tkAx5PJPNoRnJm18YQ4PRIjKrUAS5UUPZklWa-SbxO88yEcOhN5gZpnwJqaQ3RGsUQ21WtNCkYxSu_SmjgE3PYpiKv36WxeIQBpOTFQBNlCv_qVlNcVzL0RvUHLqjcfaPNRTLZbVX1OPygyzhv07rmINhEfYe4qtRYrpjZQJEimfVivl3EYTp0s3a3VYAzRbruK0TTzISgRCcHZG37jM4ijfQxeBwVplmNsrlZrgL5V1I4V4w2aBpXqs_KKAAh4sp1AM1eR7MZJKO0p2VygCcJf9pkIT_0ELfmx7Y_y-284u_kU5iOFPcaD2BqWF4ximehqlXPNGl6hdrNe0lSE5NrxVN8blTz2xcjNRT0A1HG22-7B-At1QO2RcUHj0gcP9DfFYFZLrR0Cv9TmrsNs-lU8OtVnifKSnRaXyg7o6GhaNUy_T71ksqWoASk5gLSNdj8evaBTQaC1kf0dC5IDj_CfCUzSkx0RmtdY9tJDHErF1I6585Wa5hWeN24uEFTgAjWge__NkH5hkMGdpeyYRRLjclmU_8mIqZGlaTOK-_tc78Vwoq_NfSb7gAI-u-heXYCq-fsJ6tKp3n822vBA5L4JIC8fzZB-ZRyJwbks2MkaKyplAL9FyEkxRYXPZjMjnHddhKYLpRlCW7QaFv9cmilcSq0b_Q4qKf7Lstrk9NiCeUCDY7G0qlEg8YmB4DAJoqsChWxrKdRF-X2Ni-L_B6DLecDKowkNDsvAdt7zHOK5RHq1A9161jECk6Z-rPy4rg3MR_NFXKrFrN0RrSB8_X6vXkX8s63cgSUllQsSh_cw9xlM3kPdASpTvOI-Z8B2OQjqNat1rqJpYufKurRAnFZ9THtvnTyyFeiV2Q3E6FkWU25R8H_5qNn5uaUzRg_v7LPxFNKrwdWOg1wWcu_osqVwivnTxWoSLZLvav5wENRi-VwvnwHYPtUc3elRuOy5Pkf6gTAndURJ3dndX14Db3gzZXhqU60FFluQulJLbE5VrK4Vv40W2hmuM_5-BNxsYl2Ev3MJUEYJIBnB1WgsOWa3fuUERy00mWXh4Tv6Yx88j1WIFoddMdLPiIo-b-QejWwu8atZ3jIVFvtyklSUZF7xiPdzzeCuRUTlic3QrFlmY-71gCPZ1Lnl_WkX4vejKJPxRI43KfmaBwgeNltMEpkwCpWblZIqUeqzRqo0"></img>
            <p>Восход: {current.sunrise ? formatTime(current.sunrise) : '—'}</p>

            <img class="style_icon__utnVg AppHourlyItem_icon__7R5lC" alt="" role="presentation" loading="lazy" src="https://yandex-pogoda.static-storage.net/SA9ro2770/43fc06bm/07J3rYnfh3OtRyAFpQYS_8kduCPPd2FI7Bfwu-jgGnuNwF73snomr5S4aAZ-T6jZ44UCqQdUj09VonskwtR3F3YSR_he2ITxrlWS58cEVI3I3Owy_3b06U0VJ79_IHhaX9PpFfP45L90mMl1WN2aKkABMUlEsK-_1KKqRBEGJ0VC0jWYrKrUsc11YiZnh3e9GtwOU73E8qo-BUaJ3HLqW83A6vbB6NWPF5gJl-gvmogDAmE69EFcLVfjmLVj1odlIgOH621aZtOP1PAkx1S031uePCONdkJITKV2qN8huXv9cDoUkDtHrfQo-3ZqbMhKs5HRyNdhHm90E-m3sIbm1KJid5t-qlVjzBXw1sUkBQxYLG5ybnbTqP92VjneYuhqTWFaZvO5tg6WOQi0OC2LmAPysaqFku39BbCrRqOEFRUB4zfofXkUA5_W8KbElXbP6A6NQm82IiqeJ6T7PNEqWh4RqKdg24feV9qo9endSZtSAOKZR6IOf_eDWlSwdFa3MeOXGS-JZjLs18KEBocmzDuNjEJeZVMqH1SHGu5RK0nfsVk10Dr2jCfoWMeqLqv6E-HCGQYjbo4F4rj1Uxdm1tDRlasuKmeRrAVS1vYGt50KfGyzL4fgWV9EJqv8wmlr7mPKZfDKFNyHWWmH6Z3Y2gECooq0YE9-5aF6ZQB0ltQBsnRKjKlnQKzlIGTENGW9ad5_kp30cIoOFfa7n5I7CS8RWYaSyie_ZirIxwj_KHihcJNoJUHfraaxuFdCtlSGwZLV2S5KdeOutwN0RhclvWjPfBE_tHF7zBS0qHwB-ghOA1k2wkunvbf5SDa7vQvYA2LhOtQirbzEAMpWMFbHdgJSR8h9mwdyrrZChteFVR3oTE6BjmdROnw09Dp-MRrr7DG4toG59t9leFgHauy6SUBRAJglc21PR5PKh7KkdQbQQ7eJrbnVsNy3MQa1dreda6xvw7xWUzp-VAQ534Do-R_D6zVDGgWslikL1BmtyOqz0OKpdTDPH1ei2uSRFRY20DGU6h0593HNB3BXdSe071uPn8BvlgDLXxeFey1QugoecmkVUCv2XGaaKjdIHRibkCOTKeWyzc0Vwei2cxU05UCQV4lcCNSh7gUgBLW2pi94LMwAX9RxSJylVLh-YfrKLIIo9cIr948UuplECv6ISLOwcyp3wz--NNP7BABFpUWzkyZqbng3gJ5VcHSUBGSeGGzt0z-nA5q-ZeRpPnMamx0xiscg6ue-dVm4ZBv9G6vSUmD4tYI-bQfxCXVTNyd0ofIXyQ3K9fK-tQJVhoR2nFmMTXJuVBF4rLT2mY2R6rpds9hFMYj3r2bIqdep7Ngp83NjqOaATKz00XrVE5QXVwBwV-odGVeS7VbzB0d0552qXC9C3TZCqg7WBxs8crjpblILNaGY5E5mSGjGGe3L6YGi0tgGUR0Od5AapkAWZ1fDgdbK3xpWoMwlQQb3Njb9e8494C0W44oMZGXZvbDJWH5RmjfRuGdPtNpbpFjfO9gyUxFoNXNubPVy-kZRBSbVEkFUGDx51INPF_E0l7RkvWh-b5A_tbKZLyT3266S6vhcUkumgxu1v2R4CNSa7SuKEjEim1YwHU414Ul0kAZHJJBy5Qrtu5YwP-TwNhUWN26LPVwB_meBKswUdVve0GhY31J7ZMLq1v5USrmVW49ra9FjoVgEI1xOBKGY9nN3dIYzcWUa_Yr3QV7kQiQHFyVfiCwMYJ5U0wiMZ3SZXvOYq19RmndAGJdcZsjpxxiu6GpjEtEYJ-F98"></img> 
            <p>Закат: {current.sunset ? formatTime(current.sunset) : '—'}</p> 
        </div>
      </div>

      <h3>Почасовой прогноз:</h3>
      <div className="perHourWeather" >
        {visible.map((h, i) => (
          <div className="hourWeather" key={i}>
            <p>{h.hour}:00</p>
            <img
              src={`https://yastatic.net/weather/i/icons/funky/dark/${h.icon}.svg`}
              alt={h.condition}
            />
            <p>{(h.temp > 0 ? "+" : "") + h.temp + "°"}</p>
          </div>
        ))}
      </div>      
      </div>
      )}
    </div>
  );
}
