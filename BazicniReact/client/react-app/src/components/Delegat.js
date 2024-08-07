import * as React from 'react';
import { useEffect, useState } from 'react';
import './css/delegat.css';
import { format, parse } from 'date-fns';
import axios from 'axios';
import DropdownMenu from './library_css/DropdownMenu';
import Logo from './library_css/Logo';
const Delegat = () => {
    const [momcadi, setMomcadi] = useState([]);
    const [sudci, setSudci] = useState([]);
    const [lige, setLige] = useState([]);
    const [utakmica, setUtakmica] = useState(false);
    const [blurano, setBlurano] = useState(false);
    const [blurano_pocetna, setBluranoPocetna] = useState(true);
    const [datum, setDatum] = useState('');
    const [vrijeme, setVrijeme] = useState('');
    const [datum_vrijeme, setDatum_vrijeme] = useState('');
    const [domaci, setDomaci] = useState('');
    const [gosti, setGosti] = useState('');
    const [sudac, setSudac] = useState('');
    const [sezona, setSezona] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [oznacena, setOznacena] = useState(false);
    const [nova, setNova] = useState(false);
    const [statistika, setStatistika] = useState([]);
    const [utakmica_id, setUtakmica_id] = useState(0);
    const [sveUtakmice, setSveUtakmice] = useState([]);
    const [oznacenaUtakmica, setOznacenaUtakmica] = useState([]);
    const [hover, setHover] = useState(false);

    const fetchData = async () => {
        try {
            const result = await axios.get('http://localhost:4000/getMomcadi');
            setMomcadi(
                Array.isArray(result.data.momcad) ? result.data.momcad : []
            );
            setSudci(Array.isArray(result.data.sudci) ? result.data.sudci : []);
            setLige(
                Array.isArray(result.data.sezona) ? result.data.sezona : []
            );

            const result1 = await axios.post(
                'http://localhost:4000/getStatistikaMomcadi'
            );
            setSveUtakmice(result1.data.utakmice);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const clickOdaberi = () => {
        setUtakmica(!utakmica);
        setBlurano(!blurano);
        setHover(false);
    };
    const clickUtakmica = () => {
        setUtakmica(!utakmica);
        setBlurano(!blurano);
        setNova(!nova);
        setHover(false);
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
                    const parsedDate = parse(datum, 'yyyy-MM-dd', new Date());
                    let temp_datum = format(parsedDate, 'MM/dd/yyyy');
                    const novaUtakmica = {
                        DOMACI_NAZIV: domaci.toString(),
                        GOSTI_NAZIV: gosti.toString(),
                        DATUM_UTAKMICE: temp_datum,
                        SUDAC: sudac.toString(),
                        POENI_DOMACI: 0,
                        POENI_GOSTI: 0,
                    };

                    setSveUtakmice([novaUtakmica, ...sveUtakmice]);

                    setUtakmica(false);
                    setNova(true);
                    setBlurano(false);
                    setOznacena(true);
                    setErrorMessage('');
                    setBluranoPocetna(false);
                    setUtakmica_id(result.data.utakmica_id);
                    const result1 = await axios.post(
                        'http://localhost:4000/getStatistikaMomcadi',
                        {
                            imeMomcad: domaci.toString(),
                            imeMomcad1: gosti.toString(),
                            datum: datum + ' ' + vrijeme,
                        }
                    );
                    setOznacenaUtakmica(result1.data.utakmica);
                } else setErrorMessage(result.data.message);
            } catch (err) {
                console.log(err);
            }
        } else setErrorMessage('Sva polja moraju biti označena!');
    };

    const handleOdabir = (rowItem) => {
        setOznacenaUtakmica(rowItem);
        setUtakmica_id(rowItem.UTAKMICA_ID);
        setOznacena(true);
        setUtakmica(false);
        setBlurano(false);
        setBluranoPocetna(false);
    };

    const fetchStatistika = async () => {
        if (utakmica_id > 0) {
            try {
                const res = await axios.post(
                    'http://localhost:4000/prikaziStatistikuUtakmice',
                    { utakmica_id: utakmica_id }
                );
                setStatistika(res.data.statistika);
                setOznacena(!oznacena);
            } catch (err) {
                console.log(err);
            }
        }
    };
    useEffect(() => {
        fetchStatistika();
    }, [utakmica_id]);

    return (
        <div>
            <div className={`container ${blurano ? 'blurred' : ''}`}>
                <div className={`side ${blurano_pocetna ? 'blurred' : ''}`}>
                    <Logo imeMomcad={oznacenaUtakmica.DOMACI_NAZIV} />
                </div>
                <div className="middle-container">
                    {oznacenaUtakmica.length === 0 ? (
                        <div className="above-container">
                            <div
                                className="above-middle"
                                onClick={clickUtakmica}
                            >
                                Unesi novu utakmicu
                            </div>
                            <div
                                className="above-middle"
                                onClick={clickOdaberi}
                            >
                                Odaberi završenu utakmicu
                            </div>
                        </div>
                    ) : (
                        <div
                            className="above-container"
                            onMouseEnter={() => setHover(true)}
                            onMouseLeave={() => setHover(false)}
                        >
                            {hover ? (
                                <div
                                    className="above-middle stil1"
                                    onClick={() => {
                                        setOznacenaUtakmica([]);
                                        setOznacena(false);
                                        setBluranoPocetna(true);
                                    }}
                                >
                                    <p>Klikni za promjenu utakmice</p>
                                </div>
                            ) : (
                                <div className="above-middle stil1">
                                    <h4>Označena utakmica je:</h4>
                                    <div className="match-details">
                                        <div className="match-detail">
                                            <strong>Domaći:</strong>
                                            <span>
                                                {oznacenaUtakmica.DOMACI_NAZIV}
                                            </span>
                                        </div>
                                        <div className="match-detail">
                                            <strong>Gosti:</strong>
                                            <span>
                                                {oznacenaUtakmica.GOSTI_NAZIV}
                                            </span>
                                        </div>
                                        <div className="match-detail">
                                            <strong>Sudac:</strong>
                                            <span>
                                                {oznacenaUtakmica.SUDAC}
                                            </span>
                                        </div>
                                        <div className="match-detail">
                                            <strong>Datum utakmice:</strong>
                                            <span>
                                                {
                                                    oznacenaUtakmica.DATUM_UTAKMICE
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div
                        className={`middle ${blurano_pocetna ? 'blurred' : ''}`}
                    >
                        Middle
                    </div>
                </div>
                <div className={`side ${blurano_pocetna ? 'blurred' : ''}`}>
                    <Logo imeMomcad={oznacenaUtakmica.GOSTI_NAZIV} />
                </div>
            </div>
            {utakmica ? (
                nova ? (
                    <div className="overlay" onClick={clickUtakmica}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
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
                                    <label className="label">
                                        Odaberi datum:
                                    </label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={datum}
                                        onChange={(e) =>
                                            setDatum(e.target.value)
                                        }
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
                                        onChange={(e) =>
                                            setVrijeme(e.target.value)
                                        }
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
                ) : (
                    <div className="overlay" onClick={clickOdaberi}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {[
                                                'DOMACI',
                                                'REZULTAT',
                                                'GOSTI',
                                                'SUDAC',
                                                'DATUM',
                                            ].map((column, columnIndex) => (
                                                <th key={columnIndex}>
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sveUtakmice.map(
                                            (rowItem, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    onClick={() =>
                                                        handleOdabir(rowItem)
                                                    }
                                                >
                                                    <td>
                                                        {rowItem.DOMACI_NAZIV}
                                                    </td>
                                                    <td>
                                                        {rowItem.POENI_DOMACI +
                                                            ':' +
                                                            rowItem.POENI_GOSTI}
                                                    </td>
                                                    <td>
                                                        {rowItem.GOSTI_NAZIV}
                                                    </td>
                                                    <td>{rowItem.SUDAC}</td>
                                                    <td>
                                                        {rowItem.DATUM_UTAKMICE}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="back_div">
                                <button onClick={clickOdaberi}>
                                    <i className="fa-solid fa-circle-arrow-left"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            ) : null}
            {oznacena && (
                <div className="statistics">
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    {[
                                        'NAZIV',
                                        'PODATAK',
                                        'VRIJEME NA SEMAFORU',
                                        'STATUS',
                                    ].map((column, columnIndex) => (
                                        <th key={columnIndex}>{column}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {statistika.map((rowItem, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {rowItem
                                            .slice(0, -1)
                                            .map((row, rowInd) => (
                                                <td key={rowInd}>{row}</td>
                                            ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Delegat;
