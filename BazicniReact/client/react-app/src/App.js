import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Switch, Route, Routes, Link } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import Tablica from './components/Tablica';
import Login from './components/Login';
import Home from './components/Home';
import Navigation from './components/Navigation';
import Register from './components/Register';
import Momcad from './components/Momcad';
import Igrac from './components/Igrac';
import Trade from './components/Trade';
import Statistika from './components/Statistika';
import Delegat from './components/Delegat';
function App() {
    const token = useSelector((status) => localStorage.getItem('token'));

    if (token) {
        return (
            <div className="appPozadina">
                <BrowserRouter>
                    <Navigation />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/Tablica" element={<Tablica />} />
                        <Route path="/Momcad/:imeMomcad" element={<Momcad />} />
                        <Route path="/Register" element={<Register />} />
                        <Route path="/Igrac/:imeIgrac" element={<Igrac />} />
                        <Route path="/Trade" element={<Trade />} />
                        <Route path="/Statistika" element={<Statistika />} />
                        <Route path="/Delegat" element={<Delegat />} />
                        <Route path="/*" element={<Home />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    } else {
        return (
            <div className="home_container">
                <img
                    src={`${process.env.PUBLIC_URL}/nba_pozadina.png`}
                    alt="NBA Background"
                    className="background-image"
                />
                <BrowserRouter>
                    <Routes>
                        <Route path="/*" element={<Login />} />
                    </Routes>
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
