import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Switch, Route, Routes, Link } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import Tablica from './components/Tablica';
import Login from './components/Login';
import Home from './components/Home';
import Navigation from './components/Navigation';
import Admin from './components/Admin';
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
                    <Route path="/" element={<Home token={token} />} />
                    <Route
                        path="/Tablica"
                        element={<Tablica token={token} />}
                    />
                    <Route
                        path="/Momcad/:imeMomcad"
                        element={
                            <Momcad
                                edit={
                                    roles.includes('UREDI_MOMCAD') ||
                                    roles == 'ADMIN'
                                }
                                token={token}
                            />
                        }
                    />
                    {roles == 'ADMIN' && (
                        <Route
                            path="/Admin"
                            element={<Admin roles={roles} token={token} />}
                        />
                    )}
                    <Route
                        path="/Igrac/:imeIgrac"
                        element={<Igrac token={token} />}
                    />
                    {(roles.includes('TRADE') || roles == 'ADMIN') && (
                        <Route
                            path="/Trade"
                            element={<Trade token={token} />}
                        />
                    )}
                    <Route
                        path="/Statistika"
                        element={<Statistika token={token} />}
                    />
                    {(roles.includes('DELEGAT') || roles == 'ADMIN') && (
                        <Route
                            path="/Delegat"
                            element={<Delegat token={token} />}
                        />
                    )}
                    <Route path="/Search" element={<Search token={token} />} />
                    <Route path="/*" element={<Home token={token} />} />
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
