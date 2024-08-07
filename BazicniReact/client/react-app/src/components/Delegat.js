import * as React from 'react';
import { useEffect, useState } from 'react';
import './css/delegat.css';
import axios from 'axios';
import DropdownMenu from './library_css/DropdownMenu';
const Delegat = () => {
    const [momcadi, setMomcadi] = useState([]);
    const [sudci, setSudci] = useState([]);
    const [lige, setLige] = useState([]);
    const [utakmica, setUtakmica] = useState(false);
    const [blurano, setBlurano] = useState(false);
    const [datum, setDatum] = useState('');
    const [vrijeme, setVrijeme] = useState('');
    const [datum_vrijeme, setDatum_vrijeme] = useState('');
    const [domaci, setDomaci] = useState('');
    const [gosti, setGosti] = useState('');
    const [sudac, setSudac] = useState('');
    const [sezona, setSezona] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [uzivo, setUzivo] = useState(false);
    const [oznacena, setOznacena] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.get(
                    'http://localhost:4000/getMomcadi'
                );
                setMomcadi(
                    Array.isArray(result.data.momcad) ? result.data.momcad : []
                );
                setSudci(
                    Array.isArray(result.data.sudci) ? result.data.sudci : []
                );
                setLige(
                    Array.isArray(result.data.sezona) ? result.data.sezona : []
                );
                console.log(momcadi);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    const clickUtakmica = () => {
        setUtakmica(!utakmica);
        setBlurano(!blurano);
    };

    const handleGosti = (gosti) => {
        setGosti(gosti);
    };

    const handleDomaci = (domaci) => {
        setDomaci(domaci);
    };

    const handleSudac = (sudac) => {
        setSudac(sudac);
    };

    const handleLiga = (Liga) => {
        setSezona(Liga);
    };

    const handleSave = async () => {
        if (domaci && gosti && sudac && sezona && vrijeme && datum) {
            try {
                setErrorMessage('');
                const result = await axios.post(
                    'http://localhost:4000/kreirajUtakmicu',
                    {
                        domaci: domaci.toString(),
                        gosti: gosti.toString(),
                        datum: datum + ' ' + vrijeme,
                        sezona: sezona.toString(),
                        sudac: sudac.toString(),
                    }
                );
                if (
                    result.data.message === 'Insert was completed successfully!'
                ) {
                    setErrorMessage(
                        'Uspješno krenirana utakmica! Klikom na sat započnite vrijeme i krenite zapisivati podatke!'
                    );
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    setUtakmica(!utakmica);
                    setBlurano(!blurano);
                    setOznacena(!oznacena);
                    setUzivo(!uzivo);
                    const res = await axios.post(
                        'http://localhost:4000/prikaziStatistiku',
                        { utakmica_id: result.data.utakmica_id }
                    );
                } else setErrorMessage(result.data.message);
            } catch (err) {
                console.log(err);
            }
        } else setErrorMessage('Sva polja moraju biti označena!');
    };
    return (
        <div>
            <div className={`container ${blurano ? 'blurred' : ''}`}>
                <div className="side">Domaći</div>
                <div className="middle-container">
                    <div className="above-container">
                        <div className="above-middle" onClick={clickUtakmica}>
                            Unesi novu utakmicu
                        </div>
                        <div className="above-middle">
                            Odaberi postojeću utakmicu
                        </div>
                    </div>
                    <div className="middle">Middle</div>
                </div>
                <div className="side">Gosti</div>
            </div>
            {utakmica && (
                <div className="overlay" onClick={clickUtakmica}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="dropdown_container">
                                <DropdownMenu
                                    items={momcadi}
                                    odabir="Odaberi domaćina"
                                    onSelect={handleDomaci}
                                />
                                <DropdownMenu
                                    items={momcadi}
                                    odabir="Odaberi goste"
                                    onSelect={handleGosti}
                                />
                                <DropdownMenu
                                    items={sudci}
                                    odabir="Odaberi sudca"
                                    onSelect={handleSudac}
                                />
                                <DropdownMenu
                                    items={lige}
                                    odabir="Odaberi ligu"
                                    onSelect={handleLiga}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Odaberi datum:</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={datum}
                                    onChange={(e) => setDatum(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">
                                    Odaberi vrijeme:
                                </label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={vrijeme}
                                    onChange={(e) => setVrijeme(e.target.value)}
                                />
                            </div>
                            <button onClick={handleSave}>Spremi</button>
                            {errorMessage && <p>{errorMessage}</p>}
                        </div>

                        <div className="back_div">
                            <button onClick={clickUtakmica}>
                                <i className="fa-solid fa-circle-arrow-left"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {oznacena &&
                (uzivo ? (
                    <div className="statistics">
                        Dosadašnja statistika utakmice
                    </div>
                ) : (
                    <div className="statistics">
                        Dosadašnja statistika utakmice
                    </div>
                ))}
        </div>
    );
};

export default Delegat;
