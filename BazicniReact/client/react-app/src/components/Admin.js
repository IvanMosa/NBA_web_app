import * as React from 'react';
import { useState, useEffect } from 'react';
import { CiLock, CiUnlock } from 'react-icons/ci';
import '../components/css/admin.css';
import api from '../api';

function Admin({ roles, token }) {
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerUserName, setRegisterUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [promjeneErrorMessage, setPromjeneErrorMessage] = useState('');
    const [noviKorisnikOpcije, setNoviKorisnikOpcije] = useState(['PREGLED']);
    const [korisnici, setKorisnici] = useState([]);
    const [korisniciPromjene, setKorisniciPromjene] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCell, setEditingCell] = useState(null);
    const [oznacen, setOznacen] = useState('REGISTRACIJA');
    const [promjene, setPromjene] = useState([]);
    const [onDelete, setDelete] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState(null);

    const handleOptionChange = (event) => {
        const value = event.target.value;
        if (value == 'SVE') {
            if (
                noviKorisnikOpcije.includes('PREGLED') &&
                noviKorisnikOpcije.includes('TRADE') &&
                noviKorisnikOpcije.includes('DELEGAT') &&
                noviKorisnikOpcije.includes('UREDI_MOMCAD')
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

    const handleRoleChange = (user, uloga) => {
        setPromjene((prev) => {
            const postoji = prev.some(
                (korisnik) =>
                    korisnik.KORISNIK === user && korisnik.ULOGA === uloga
            );
            if (postoji) {
                return prev.filter(
                    (korisnik) =>
                        !(
                            korisnik.KORISNIK === user &&
                            korisnik.ULOGA === uloga
                        )
                );
            } else {
                return [...prev, { KORISNIK: user, ULOGA: uloga }];
            }
        });

        setKorisniciPromjene((prev) => {
            return prev.map((korisnik) => {
                if (korisnik.KORISNIK === user) {
                    const ulogeKorisnika = korisnik.ULOGE
                        ? korisnik.ULOGE.split(',')
                        : [];

                    if (ulogeKorisnika.includes(uloga)) {
                        const novaUlogeKorisnika = ulogeKorisnika.filter(
                            (pojedinaUloga) => pojedinaUloga !== uloga
                        );
                        return {
                            KORISNIK: korisnik.KORISNIK,
                            ULOGE: novaUlogeKorisnika.join(','),
                            STATUS: korisnik.STATUS,
                        };
                    } else {
                        ulogeKorisnika.push(uloga);
                        return {
                            KORISNIK: korisnik.KORISNIK,
                            ULOGE: ulogeKorisnika.join(','),
                            STATUS: korisnik.STATUS,
                        };
                    }
                }
                return korisnik;
            });
        });
    };

    const potvrdiZakljucavanje = (korisnik, aktivan) => {
        return new Promise((resolve) => {
            const handleConfirm = () => resolve(true);
            const handleCancel = () => resolve(false);

            setConfirmationDialog({
                message:
                    'Jeste li sigurni da želite korisniku: ' +
                    korisnik +
                    " promjeniti aktivnost u '" +
                    aktivan +
                    "'?",
                onConfirm: handleConfirm,
                onCancel: handleCancel,
            });
        });
    };
    const handleZakljucaj = async (korisnik, aktivan) => {
        setDelete(true);
        let confirm = await potvrdiZakljucavanje(korisnik, aktivan);
        try {
            setDelete(false);
            if (confirm) {
                const zakljucaj = await api.post(
                    '/adminPromjeniAktivnost',
                    { korisnik: korisnik, aktivnost: aktivan },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (
                    zakljucaj.data.message == 'Uspješno promjenjena aktivnost!'
                ) {
                    setPromjeneErrorMessage('Uspješno promjenjena aktivnost!');
                    prikaziSveKorisnike();
                    setIsEditing(false);
                    setKorisniciPromjene([]);
                    setPromjene([]);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };
    const prikaziSveKorisnike = async () => {
        try {
            const korisnici = await api.post(
                '/adminSviKorisnici',
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            setKorisnici(korisnici.data.korisnici);
            setKorisniciPromjene(korisnici.data.korisnici);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (roles == 'ADMIN') {
            prikaziSveKorisnike();
        }
    }, []);

    const handleSubmitRegister = (e) => {
        fetch('http://localhost:4000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                userName: registerUserName,
                password: registerPassword,
                roles: noviKorisnikOpcije,
            }),
        })
            .then((response) => {
                if (response.status && response.status === 200) {
                    setKorisnici((prev) => [
                        ...prev,
                        {
                            KORISNIK: registerUserName,
                            ULOGE: noviKorisnikOpcije.join(','),
                        },
                    ]);
                    setErrorMessage('Uspješno kreiran novi korisnik!');
                } else if (response.status && response.status === 500) {
                    console.log('Failed to create user');
                } else if (response.status && response.status === 201) {
                    setErrorMessage('Korisničko ime već postoji!');
                } else if (response.status && response.status === 202) {
                    setErrorMessage('Unesite korisničko ime!');
                } else if (response.status && response.status === 203) {
                    setErrorMessage('Unesite šifru korisnika!');
                }
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
                return response.json();
            })
            .then((data) => {
                console.log(data.message);
            })
            .catch((error) => {
                console.log(error);
                if (error === 'Account Exists')
                    setErrorMessage('Account already exists');
                if (error === 'Registration failed')
                    setErrorMessage('Registration failed');
            });
        e.preventDefault();
    };

    const handleSave = async () => {
        if (promjene.length === 0) {
            setPromjeneErrorMessage('Nema unešenih promjena');
        }
        try {
            const unesiPromjene = await api.post(
                '/adminDodajRole',
                { promjene: promjene },
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            prikaziSveKorisnike();
            setIsEditing(false);
            setKorisniciPromjene([]);
            setPromjene([]);
            setRegisterUserName('');
            setRegisterPassword('');
            setPromjeneErrorMessage(unesiPromjene.data.message);
        } catch (err) {
            console.log(err);
        }
    };

    const potvrdi = (korisnik) => {
        return new Promise((resolve) => {
            const handleConfirm = () => resolve(true);
            const handleCancel = () => resolve(false);

            setConfirmationDialog({
                message:
                    'Jeste li sigurni da želite obrisati korisnika: ' +
                    korisnik.KORISNIK +
                    '?',
                onConfirm: handleConfirm,
                onCancel: handleCancel,
            });
        });
    };

    const handleDelete = async (korisnik) => {
        setDelete(true);
        let confirm = await potvrdi(korisnik);
        try {
            setDelete(false);
            if (confirm) {
                const izbrisi = await api.post(
                    '/adminIzbrisiKorisnika',
                    { korisnik: korisnik },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (izbrisi.data.message == 'Uspješno obrisan korisnik!') {
                    setKorisnici((sviKorisnici) =>
                        sviKorisnici.filter(
                            (pojediniKorisnici) =>
                                pojediniKorisnici.KORISNIK !== korisnik.KORISNIK
                        )
                    );
                    setPromjeneErrorMessage('Deleting...');
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    setPromjeneErrorMessage(izbrisi.data.message);
                    setIsEditing(false);
                }
            }
        } catch (err) {
            console.log(err);
        }
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
                        <div className="registerNaslov">
                            <div
                                className={
                                    oznacen == 'REGISTRACIJA'
                                        ? 'registration_title clicked'
                                        : 'registration_title'
                                }
                                onClick={() => {
                                    setOznacen('REGISTRACIJA');
                                    setIsEditing(false);
                                    setEditingCell(null);
                                }}
                            >
                                Registriraj novog korisnika
                            </div>
                            <div
                                className={
                                    oznacen == 'KORISNICI'
                                        ? 'registration_title clicked'
                                        : 'registration_title'
                                }
                                onClick={() => setOznacen('KORISNICI')}
                            >
                                Pregled registriranih korisnika
                            </div>
                        </div>
                        {oznacen == 'REGISTRACIJA' ? (
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
                                                setRegisterUserName(
                                                    e.target.value
                                                );
                                            }}
                                        />
                                    </div>
                                    <div className="registration_input">
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Šifra"
                                            onChange={(e) => {
                                                setRegisterPassword(
                                                    e.target.value
                                                );
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
                                                    onChange={
                                                        handleOptionChange
                                                    }
                                                    disabled={true}
                                                />
                                                <h5>
                                                    Pregled (Početna stranica,
                                                    momčadi, igrači i
                                                    statistika)
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
                                                    onChange={
                                                        handleOptionChange
                                                    }
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
                                                    onChange={
                                                        handleOptionChange
                                                    }
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
                                                    onChange={
                                                        handleOptionChange
                                                    }
                                                />
                                                <h5>Uredi momčad</h5>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="registerRoleLabel">
                                                <input
                                                    type="checkbox"
                                                    value="SVE"
                                                    checked={
                                                        noviKorisnikOpcije.includes(
                                                            'PREGLED'
                                                        ) &&
                                                        noviKorisnikOpcije.includes(
                                                            'TRADE'
                                                        ) &&
                                                        noviKorisnikOpcije.includes(
                                                            'DELEGAT'
                                                        ) &&
                                                        noviKorisnikOpcije.includes(
                                                            'UREDI_MOMCAD'
                                                        )
                                                    }
                                                    onChange={
                                                        handleOptionChange
                                                    }
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
                                <div
                                    className={
                                        errorMessage
                                            ? 'error_message message'
                                            : 'error_message'
                                    }
                                >
                                    {errorMessage && (
                                        <p
                                            style={
                                                errorMessage ==
                                                'Uspješno kreiran novi korisnik!'
                                                    ? { color: 'green' }
                                                    : { color: 'red' }
                                            }
                                        >
                                            {errorMessage}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
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
                                            <h4>MOMČAD</h4>
                                        </div>
                                        <div className="zaglavljePodatak">
                                            <h4>AKTIVNOST</h4>
                                        </div>
                                    </div>
                                    <div className="korisnikTijelo">
                                        {(promjene.length > 0
                                            ? korisniciPromjene
                                            : korisnici
                                        ).map((korisnik, index) => (
                                            <div
                                                className="registerKorisnik"
                                                key={index}
                                                onMouseEnter={() => {
                                                    if (!isEditing)
                                                        setEditingCell(index);
                                                }}
                                                onClick={() => {
                                                    if (isEditing)
                                                        setEditingCell(index);
                                                }}
                                            >
                                                <div className="korisnikNaziv">
                                                    <h5
                                                        style={{
                                                            opacity:
                                                                korisnik.STATUS ==
                                                                'Neaktivan'
                                                                    ? '0.4'
                                                                    : '1',
                                                        }}
                                                    >
                                                        {korisnik.KORISNIK}
                                                    </h5>
                                                </div>
                                                <div className="korisnikUloga">
                                                    <input
                                                        type="checkbox"
                                                        value="PREGLED"
                                                        disabled={
                                                            korisnik.STATUS ==
                                                                'Neaktivan' ||
                                                            !isEditing ||
                                                            editingCell !==
                                                                index
                                                        }
                                                        checked={
                                                            korisnik &&
                                                            korisnik.ULOGE &&
                                                            korisnik.ULOGE.includes(
                                                                'PREGLED'
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleRoleChange(
                                                                korisnik.KORISNIK,
                                                                'PREGLED'
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="korisnikUloga">
                                                    <input
                                                        type="checkbox"
                                                        value="TRADE"
                                                        disabled={
                                                            korisnik.STATUS ==
                                                                'Neaktivan' ||
                                                            !isEditing ||
                                                            editingCell !==
                                                                index
                                                        }
                                                        checked={
                                                            korisnik &&
                                                            korisnik.ULOGE &&
                                                            korisnik.ULOGE.includes(
                                                                'TRADE'
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleRoleChange(
                                                                korisnik.KORISNIK,
                                                                'TRADE'
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="korisnikUloga">
                                                    <input
                                                        type="checkbox"
                                                        value="DELEGAT"
                                                        disabled={
                                                            korisnik.STATUS ==
                                                                'Neaktivan' ||
                                                            !isEditing ||
                                                            editingCell !==
                                                                index
                                                        }
                                                        checked={
                                                            korisnik &&
                                                            korisnik.ULOGE &&
                                                            korisnik.ULOGE.includes(
                                                                'DELEGAT'
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleRoleChange(
                                                                korisnik.KORISNIK,
                                                                'DELEGAT'
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="korisnikUloga">
                                                    <input
                                                        type="checkbox"
                                                        value="UREDI_MOMCAD"
                                                        disabled={
                                                            korisnik.STATUS ==
                                                                'Neaktivan' ||
                                                            !isEditing ||
                                                            editingCell !==
                                                                index
                                                        }
                                                        checked={
                                                            korisnik &&
                                                            korisnik.ULOGE &&
                                                            korisnik.ULOGE.includes(
                                                                'UREDI_MOMCAD'
                                                            )
                                                        }
                                                        onChange={() =>
                                                            handleRoleChange(
                                                                korisnik.KORISNIK,
                                                                'UREDI_MOMCAD'
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className="korisnikUloga"
                                                    style={
                                                        !isEditing ||
                                                        editingCell !== index
                                                            ? {
                                                                  pointerEvents:
                                                                      'none',
                                                                  opacity:
                                                                      '0.4',
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {korisnik.STATUS ==
                                                    'Neaktivan' ? (
                                                        <CiLock
                                                            className="adminIkonica"
                                                            onClick={() =>
                                                                handleZakljucaj(
                                                                    korisnik.KORISNIK,
                                                                    'Aktivan'
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <CiUnlock
                                                            className="adminIkonica"
                                                            onClick={() =>
                                                                handleZakljucaj(
                                                                    korisnik.KORISNIK,
                                                                    'Neaktivan'
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </div>
                                                <div className="korisnikUloga ikona">
                                                    {isEditing &&
                                                        editingCell ===
                                                            index && (
                                                            <>
                                                                <i
                                                                    className={`fas fa-save`}
                                                                    onClick={() =>
                                                                        handleSave()
                                                                    }
                                                                ></i>
                                                                <i
                                                                    class="fa-solid fa-delete-left"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            korisnik
                                                                        )
                                                                    }
                                                                ></i>
                                                            </>
                                                        )}
                                                    {editingCell === index && (
                                                        <i
                                                            className={`fas fa-edit`}
                                                            onClick={() => {
                                                                setIsEditing(
                                                                    !isEditing
                                                                );
                                                                setPromjene([]);
                                                                setKorisniciPromjene(
                                                                    korisnici
                                                                );
                                                            }}
                                                        ></i>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {promjeneErrorMessage && (
                                    <div className="errorOverlay">
                                        <div className="errorModal">
                                            <p
                                                className="errorMessage"
                                                style={
                                                    promjeneErrorMessage ==
                                                        'Uspješno obrisan korisnik!' ||
                                                    promjeneErrorMessage ==
                                                        'Uspješno unesene promjene' ||
                                                    promjeneErrorMessage ==
                                                        'Uspješno promjenjena aktivnost!'
                                                        ? {
                                                              color: 'green',
                                                          }
                                                        : { color: '' }
                                                }
                                            >
                                                {promjeneErrorMessage}
                                            </p>
                                            {promjeneErrorMessage !==
                                                'Deleting...' && (
                                                <button
                                                    type="button"
                                                    className="okButton"
                                                    onClick={() =>
                                                        setPromjeneErrorMessage(
                                                            ''
                                                        )
                                                    }
                                                >
                                                    OK
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {onDelete && (
                                    <div className="errorOverlay">
                                        <div className="errorModal">
                                            <p className="errorMessage">
                                                {confirmationDialog.message}
                                            </p>
                                            <button
                                                type="button"
                                                className="okButton"
                                                onClick={
                                                    confirmationDialog.onConfirm
                                                }
                                            >
                                                Da
                                            </button>
                                            <button
                                                type="button"
                                                className="okButton"
                                                onClick={
                                                    confirmationDialog.onCancel
                                                }
                                            >
                                                Odustani
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
}

export default Admin;
