import './App.css'
import { Routes, Route, Link } from 'react-router-dom';
import HomeWeather from './pages/HomeWeather'
import SevenDaysWeather from './pages/SevenDaysWeather'
import WorldWeather from './pages/WorldWeather'


function App() {
  return(
  <>  
    <div className="headerBlock">
      <nav className='headerNav'>
        <Link className='firstBar' to="/">Главная</Link>{' '}
        <Link className='secondBar' to="/7-days-weather">На 7 дней</Link>{' '}
        <Link className='thirdBar' to="/world-weather">В мире</Link>
      </nav>
    </div>
      <Routes>
        <Route path="/" element={<HomeWeather />} />
        <Route path="/7-days-weather" element={<SevenDaysWeather />} />
        <Route path="/world-weather" element={<WorldWeather />} />
      </Routes>
   
  </>
  )
}

export default App
