import './App.css'
import { Routes, Route, Link } from 'react-router-dom';
import HomeWeather from './pages/HomeWeather'
import TenDaysWeather from './pages/TenDaysWeather'
import MapsWeather from './pages/MapsWeather'


function App() {
  return(
  <>  
    <div className="headerBlock">
      <nav className='headerNav'>
        <Link className='firstBar' to="/">Главная</Link>{' '}
        <Link className='secondBar' to="/10-days-weather">На 10 дней</Link>{' '}
        <Link className='thirdBar' to="/maps-weather">Карты</Link>
      </nav>
    </div>
      <Routes>
        <Route path="/" element={<HomeWeather />} />
        <Route path="/10-days-weather" element={<TenDaysWeather />} />
        <Route path="/maps-weather" element={<MapsWeather />} />
      </Routes>
   
  </>
  )
}

export default App
