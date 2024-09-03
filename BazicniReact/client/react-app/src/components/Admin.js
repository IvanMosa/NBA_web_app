import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/admin.css';
import axios from 'axios';

function Register({ roles, token }) {
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerUserName, setRegisterUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [noviKorisnikOpcije, setNoviKorisnikOpcije] = useState('PREGLED');
    const [selectedOptions, setSelectedOptions] = useState('');
    const [korisnici, setKorisnici] = useState([]);
    const handleOptionChange = (event) => {
        const value = event.target.value;
        if (value == 'SVE') {
            if (
                noviKorisnikOpcije.includes(
                    'PREGLED',
                    'TRADE',
                    'DELEGAT',
                    'UREDI_MOMCAD'
                )
            ) {
                setNoviKorisnikOpcije(['PREGLED']);
            } else {
                setNoviKorisnikOpcije([
                    'PREGLED',
                    'TRADE',
                    'DELEGAT',
                    'UREDI_MOMCAD',
                ]);
            }
        } else {
            setNoviKorisnikOpcije((prevSelectedOptions) =>
                prevSelectedOptions.includes(value)
                    ? prevSelectedOptions.filter((option) => option !== value)
                    : [...prevSelectedOptions, value]
            );
        }
    };

    useEffect(() => {
        if (roles == 'ADMIN') {
            const prikaziSveKorisnike = async () => {
                try {
                    const korisnici = await axios.post(
                        'http://localhost:4000/adminSviKorisnici',
                        {},
                        {
                            headers: {
                                authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setKorisnici(korisnici.data.korisnici);
                } catch (err) {
                    console.log(err);
                }
            };

            prikaziSveKorisnike();
        }
    }, []);
    const handleSubmitRegister = (e) => {
        console.log(registerUserName, registerPassword);

        fetch('http://localhost:4000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: registerUserName,
                password: registerPassword,
                roles: noviKorisnikOpcije,
            }),
        })
            .then((response) => {
                console.log(response);
                if (response.status === 200) {
                    console.log('User created succesfuly');
                } else if (response.status === 500) {
                    console.log('Username exists');
                    throw new Error('Account Exists');
                } else {
                    console.log('Failed to create user');
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then((data) => console.log(data))
            .catch((error) => {
                console.log(error);
                if (error === 'Account Exists')
                    setErrorMessage('Account already exists');
                if (error === 'Registration failed')
                    setErrorMessage('Registration failed');
            });
        e.preventDefault();
    };
    if (roles == 'ADMIN')
        return (
            <div className="home_container">
                <img
                    src={`${process.env.PUBLIC_URL}/nba_pozadina.png`}
                    alt="NBA Background"
                    className="background-image"
                />
                <div className="registration_container">
                    <div className="registerBlock">
                        <div className="registration_title">
                            Registriraj novog korisnika
                        </div>
                        <div className="registration_form">
                            <form
                                onSubmit={(event) =>
                                    handleSubmitRegister(event)
                                }
                            >
                                <div className="registration_input">
                                    <input
                                        type="text"
                                        name="user_name"
                                        placeholder="Korisničko ime"
                                        onChange={(e) => {
                                            setRegisterUserName(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="registration_input">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Šifra"
                                        onChange={(e) => {
                                            setRegisterPassword(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="registerRole">
                                    <h4>Odaberi uloge korisnika:</h4>
                                    <div>
                                        <label className="registerRoleLabel">
                                            <input
                                                type="checkbox"
                                                value="PREGLED"
                                                checked={noviKorisnikOpcije.includes(
                                                    'PREGLED'
                                                )}
                                                onChange={handleOptionChange}
                                            />
                                            <h5>
                                                Pregled (Početna stranica,
                                                momčadi, igrači i statistika)
                                            </h5>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="registerRoleLabel">
                                            <input
                                                type="checkbox"
                                                value="TRADE"
                                                checked={noviKorisnikOpcije.includes(
                                                    'TRADE'
                                                )}
                                                onChange={handleOptionChange}
                                            />
                                            <h5>Trade</h5>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="registerRoleLabel">
                                            <input
                                                type="checkbox"
                                                value="DELEGAT"
                                                checked={noviKorisnikOpcije.includes(
                                                    'DELEGAT'
                                                )}
                                                onChange={handleOptionChange}
                                            />
                                            <h5>Delegat</h5>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="registerRoleLabel">
                                            <input
                                                type="checkbox"
                                                value="UREDI_MOMCAD"
                                                checked={noviKorisnikOpcije.includes(
                                                    'UREDI_MOMCAD'
                                                )}
                                                onChange={handleOptionChange}
                                            />
                                            <h5>Uredi momčad</h5>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="registerRoleLabel">
                                            <input
                                                type="checkbox"
                                                value="SVE"
                                                checked={noviKorisnikOpcije.includes(
                                                    'PREGLED',
                                                    'TRADE',
                                                    'DELEGAT',
                                                    'UREDI_MOMCAD'
                                                )}
                                                onChange={handleOptionChange}
                                            />
                                            <h5>Sve</h5>
                                        </label>
                                    </div>
                                </div>
                                <button
                                    className="submit_register"
                                    type="submit"
                                    value="submit"
                                >
                                    Kreiraj Korisnika
                                </button>
                            </form>
                            {errorMessage && (
                                <div className="error_message">
                                    {errorMessage}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="registerBlock">
                        <div className="registration_title">
                            Pregled postojećih korisnika
                        </div>
                        <div className="korisnik_form">
                            <div className="korisnikZaglavlje">
                                <div className="zaglavljeNaziv">
                                    <h4>Korisnik</h4>
                                </div>
                                <div className="zaglavljePodatak">
                                    <h4>PREGLED</h4>
                                </div>
                                <div className="zaglavljePodatak">
                                    <h4>TRADE</h4>
                                </div>
                                <div className="zaglavljePodatak">
                                    <h4>DELEGAT</h4>
                                </div>
                                <div className="zaglavljePodatak">
                                    <h4>UREDI MOMČAD</h4>
                                </div>
                            </div>
                            {korisnici.map((korisnik, index) => (
                                <div className="registerKorisnik" key={index}>
                                    <div className="korisnikNaziv">
                                        <h5>{korisnik.KORISNIK}</h5>
                                    </div>
                                    <div className="korisnikUloga">
                                        <input
                                            type="checkbox"
                                            value="PREGLED"
                                            checked={
                                                korisnik &&
                                                korisnik.ULOGE.includes(
                                                    'PREGLED'
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="korisnikUloga">
                                        <input
                                            type="checkbox"
                                            value="TRADE"
                                            checked={
                                                korisnik &&
                                                korisnik.ULOGE.includes('TRADE')
                                            }
                                        />
                                    </div>
                                    <div className="korisnikUloga">
                                        <input
                                            type="checkbox"
                                            value="DELEGAT"
                                            checked={
                                                korisnik &&
                                                korisnik.ULOGE.includes(
                                                    'DELEGAT'
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="korisnikUloga">
                                        <input
                                            type="checkbox"
                                            value="UREDI_MOMCAD"
                                            checked={
                                                korisnik &&
                                                korisnik.ULOGE.includes(
                                                    'UREDI_MOMCAD'
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default Register;
