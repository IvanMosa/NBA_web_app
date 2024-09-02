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
import Search from './components/Search';
function App() {
    const token = useSelector((status) => localStorage.getItem('token'));
    const roles = useSelector((status) => localStorage.getItem('roles'));

    if (token) {
        return (
            <BrowserRouter>
                <Navigation roles={roles} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/Tablica" element={<Tablica />} />
                    <Route
                        path="/Momcad/:imeMomcad"
                        element={
                            <Momcad
                                edit={
                                    roles.includes('urediMomcad') ||
                                    roles == 'all'
                                }
                            />
                        }
                    />
                    {roles.includes('register') ||
                        (roles == 'all' && (
                            <Route path="/Register" element={<Register />} />
                        ))}
                    <Route path="/Igrac/:imeIgrac" element={<Igrac />} />
                    {roles.includes('trade') ||
                        (roles == 'all' && (
                            <Route path="/Trade" element={<Trade />} />
                        ))}
                    <Route path="/Statistika" element={<Statistika />} />
                    {roles.includes('delegat') ||
                        (roles == 'all' && (
                            <Route path="/Delegat" element={<Delegat />} />
                        ))}
                    <Route path="/Search" element={<Search />} />
                    <Route path="/*" element={<Home />} />
                </Routes>
            </BrowserRouter>
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
