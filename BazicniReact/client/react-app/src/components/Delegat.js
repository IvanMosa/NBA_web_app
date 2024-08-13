import * as React from 'react';
import { useEffect, useState } from 'react';
import './css/delegat.css';
import { format, parse } from 'date-fns';
import axios from 'axios';
import DropdownMenu from './library_css/DropdownMenu';
import Logo from './library_css/Logo';
import OdabirPodatka from './library_css/OdabirPodatka';
import DelegatIgraci from './library_css/Delegat_Igraci';

const Delegat = () => {
    const [momcadi, setMomcadi] = useState([]);
    const [sudci, setSudci] = useState([]);
    const [lige, setLige] = useState([]);
    const [utakmica, setUtakmica] = useState(false);
    const [blurano, setBlurano] = useState(false);
    const [blurano_pocetna, setBluranoPocetna] = useState(true);
    const [datum, setDatum] = useState('');
    const [vrijeme, setVrijeme] = useState('');
    const [domaci, setDomaci] = useState('');
    const [gosti, setGosti] = useState('');
    const [sudac, setSudac] = useState('');
    const [sezona, setSezona] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [oznacena, setOznacena] = useState(false);
    const [nova, setNova] = useState(false);
    const [statistika, setStatistika] = useState([]);
    const [utakmica_id, setUtakmica_ID] = useState(0);
    const [sveUtakmice, setSveUtakmice] = useState([]);
    const [oznacenaUtakmica, setOznacenaUtakmica] = useState([]);
    const [hover, setHover] = useState(false);
    const [statusi, setStatusi] = useState([]);
    const [statistickiPodatci, setStatistickiPodatci] = useState([]);
    const [igraci_domaci, setIgraciDomaci] = useState([]);
    const [igraci_gosti, setIgraciGosti] = useState([]);
    const [aktivni_domaci, setAktivniDomaci] = useState([]);
    const [aktivni_gosti, setAktivniGosti] = useState([]);
    const [starteri_spremljeni, setStarteriSpremljeni] = useState(false);
    const [Igrac_promjena, setIgracPromjena] = useState([]);
    const [oznaceni_podatak, setOznaceniPodatak] = useState('');
    const [Igrac_ulazi, setIgracUlazi] = useState([]);
    const [potvrdaPromjene, setPotvrdaPromjene] = useState(false);
    const [zavrsena, setZavrsena] = useState(false);

    const fetchData = async () => {
        try {
            const pocetniPodatci = await axios.get(
                'http://localhost:4000/getMomcadi'
            );
            setMomcadi(
                Array.isArray(pocetniPodatci.data.momcad)
                    ? pocetniPodatci.data.momcad
                    : []
            );
            setSudci(
                Array.isArray(pocetniPodatci.data.sudci)
                    ? pocetniPodatci.data.sudci
                    : []
            );
            setLige(
                Array.isArray(pocetniPodatci.data.sezona)
                    ? pocetniPodatci.data.sezona
                    : []
            );

            const statistikaMomcadi = await axios.post(
                'http://localhost:4000/getStatistikaMomcadi'
            );
            setSveUtakmice(statistikaMomcadi.data.utakmice);

            const statPodatci_statusi = await axios.post(
                'http://localhost:4000/getStatistickiPodatci'
            );

            console.log(statPodatci_statusi.data.statistickiPodatci);
            console.log(statPodatci_statusi.data.statusi);
            setStatistickiPodatci(
                Array.isArray(statPodatci_statusi.data.statistickiPodatci)
                    ? statPodatci_statusi.data.statistickiPodatci
                    : []
            );
            setStatusi(
                Array.isArray(statPodatci_statusi.data.statusi)
                    ? statPodatci_statusi.data.statusi
                    : []
            );
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
                    setErrorMessage('Uspješno krenirana utakmica!');
                    setUtakmica_ID(result.data.UTAKMICA_ID);
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
                    setNova(false);
                    setBlurano(false);
                    setOznacena(true);
                    setErrorMessage('');
                    setBluranoPocetna(false);
                    setZavrsena(false);
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
        setUtakmica_ID(rowItem.UTAKMICA_ID);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (utakmica_id !== 0) {
                try {
                    const [statistikaResponse, igraciResponses] =
                        await Promise.all([
                            axios.post(
                                'http://localhost:4000/prikaziStatistikuUtakmice',
                                {
                                    utakmica_id: utakmica_id,
                                    domaci_naziv:
                                        oznacenaUtakmica.DOMACI_NAZIV.toString(),
                                    gosti_naziv:
                                        oznacenaUtakmica.GOSTI_NAZIV.toString(),
                                }
                            ),
                            Promise.all([
                                axios.post('http://localhost:4000/showRoster', {
                                    imeMomcad:
                                        oznacenaUtakmica.DOMACI_NAZIV.toString(),
                                    status: 0,
                                }),
                                axios.post('http://localhost:4000/showRoster', {
                                    imeMomcad:
                                        oznacenaUtakmica.GOSTI_NAZIV.toString(),
                                    status: 0,
                                }),
                            ]),
                        ]);

                    const domaci_temp = igraciResponses[0].data.igraci.map(
                        (igrac) => ({
                            ...igrac,
                            oznacen: false,
                        })
                    );

                    const gosti_temp = igraciResponses[1].data.igraci.map(
                        (igrac) => ({
                            ...igrac,
                            oznacen: false,
                        })
                    );
                    if (statistikaResponse.data.statistika.length !== 0) {
                        const aktivni_domaci_temp =
                            statistikaResponse.data.aktivni_domaci.map(
                                (igrac) => ({
                                    ...igrac,
                                    oznacen: false,
                                })
                            );
                        const aktivni_gosti_temp =
                            statistikaResponse.data.aktivni_gosti.map(
                                (igrac) => ({
                                    ...igrac,
                                    oznacen: false,
                                })
                            );
                        if (
                            aktivni_domaci_temp.length !== 0 &&
                            aktivni_gosti_temp.length !== 0
                        ) {
                            await Promise.all(
                                [setAktivniDomaci(aktivni_domaci_temp)],
                                [setAktivniGosti(aktivni_gosti_temp)]
                            );

                            setIgraciDomaci(domaci_temp);
                            setIgraciGosti(gosti_temp);
                            setZavrsena(false);
                        } else {
                            await Promise.all(
                                [setAktivniDomaci(domaci_temp)],
                                [setAktivniGosti(gosti_temp)]
                            );
                            setZavrsena(true);
                        }
                        setStarteriSpremljeni(true);
                    }

                    setStatistika(statistikaResponse.data.statistika);
                    setOznacena(!oznacena);
                    setUtakmica(false);
                    setBlurano(false);
                    setBluranoPocetna(false);
                } catch (err) {
                    console.log('Error during fetch:', err);
                }
            }
        };

        fetchData();
    }, [utakmica_id]);

    const handleAktivniDomaci = (igrac, status) => {
        if (status === 0) setAktivniDomaci([...aktivni_domaci, igrac]);
        else {
            const newStarteri = aktivni_domaci.filter(
                (item) => item.NAZIV !== igrac.NAZIV
            );
            setAktivniDomaci(newStarteri);
        }
    };

    const handleAktivniGosti = (igrac, status) => {
        if (status === 0) setAktivniGosti([...aktivni_gosti, igrac]);
        else {
            const newStarteri = aktivni_gosti.filter(
                (item) => item.NAZIV !== igrac.NAZIV
            );
            setAktivniGosti(newStarteri);
        }
    };

    const handleStarteriSave = async () => {
        const domaci_temp = aktivni_domaci.map((igrac) => ({
            ...igrac,
            oznacen: false,
        }));
        setAktivniDomaci(domaci_temp);

        const gosti_temp = aktivni_gosti.map((igrac) => ({
            ...igrac,
            oznacen: false,
        }));
        setAktivniGosti(gosti_temp);
        setStarteriSpremljeni(true);

        try {
            const result = await axios.post(
                'http://localhost:4000/unesiStatistiku',
                {
                    utakmica_id: utakmica_id,
                    aktivni_domaci: domaci_temp,
                    aktivni_gosti: gosti_temp,
                    status: 2,
                    podatak: 'Ulaz/Izlaz',
                }
            );
        } catch (err) {
            console.log(err);
        }
    };

    const handleOznacenIgrac = (oznacenIgrac, status) => {
        if (oznacenIgrac.length === 0 && status === 0) {
            setIgracPromjena([]);
        } else if (oznacenIgrac.length !== 0 && status === 0) {
            setIgracPromjena(oznacenIgrac);
        } else if (oznacenIgrac.length !== 0 && status === 1) {
            setIgracUlazi(oznacenIgrac);
        } else if (oznacenIgrac.length === 0 && status === 1) {
            Igrac_ulazi.oznacen = false;
            setIgracUlazi([]);
        }
    };

    const handleOznaceniPodatak = (podatak) => {
        setOznaceniPodatak(podatak);
    };

    const handleConfirm = (status, minute, sekunde) => {
        setPotvrdaPromjene(true);
        unesiPromjene(status, minute, sekunde, Igrac_promjena, Igrac_ulazi);
    };

    const unesiPromjene = async (
        status,
        minute,
        sekunde,
        Igrac_promjena,
        Igrac_ulazi
    ) => {
        try {
            // if (oznaceni_podatak == 'Ulaz/Izlaz') {
            //     const result = await axios.post(
            //         'http://localhost:4000/unesiStatistiku',
            //         {
            //             igrac_id: Igrac_promjena,
            //             igrac_ulaz_id: Igrac_ulazi,
            //             status: status.toString(),
            //             minute: minute,
            //             sekunde: sekunde,
            //             podatak: oznaceni_podatak.toString(),
            //             utakmica_id: utakmica_id,
            //         }
            //     );
            // } else {
            //     const result = await axios.post(
            //         'http://localhost:4000/unesiStatistiku',
            //         {
            //             igrac_id: Igrac_promjena,
            //             status: status.toString(),
            //             minute: minute,
            //             sekunde: sekunde,
            //             podatak: oznaceni_podatak.toString(),
            //             utakmica_id: utakmica_id,
            //         }
            //     );
            // }

            await new Promise((resolve) => setTimeout(resolve, 750));
            setPotvrdaPromjene(false);

            Igrac_promjena.oznacen = false;
            Igrac_ulazi.oznacen = false;
            setIgracPromjena([]);
            setIgracUlazi([]);
            console.log(status);
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div>
            <div className={`container ${blurano ? 'blurred' : ''}`}>
                <div className={`side ${blurano_pocetna ? 'blurred' : ''}`}>
                    {!blurano_pocetna && (
                        <>
                            <div className="p_logo">
                                <Logo
                                    imeMomcad={oznacenaUtakmica.DOMACI_NAZIV}
                                />
                                <p>{oznacenaUtakmica.DOMACI_NAZIV}</p>
                            </div>
                            {!starteri_spremljeni ? (
                                <DelegatIgraci
                                    igraci={igraci_domaci}
                                    start={true}
                                    onSelect={handleAktivniDomaci}
                                />
                            ) : (
                                <DelegatIgraci
                                    igraci={aktivni_domaci}
                                    start={false}
                                    onSelectIgrac={handleOznacenIgrac}
                                    oznaceniIgrac={Igrac_promjena}
                                    izlaz={
                                        oznaceni_podatak == 'Ulaz/Izlaz'
                                            ? igraci_domaci
                                            : []
                                    }
                                    ulaziIgrac={Igrac_ulazi}
                                    setIgraci={setAktivniDomaci}
                                    setIzlaz={setIgraciDomaci}
                                    potvrdaPromjene={potvrdaPromjene}
                                    setPotvrdaPromjene={setPotvrdaPromjene}
                                />
                            )}
                        </>
                    )}
                </div>
                <div className="middle-container">
                    {oznacenaUtakmica.length === 0 ? (
                        <div className="above-container">
                            <div
                                className="above-middle"
                                onClick={clickUtakmica}
                            >
                                <p>Unesi novu utakmicu</p>
                            </div>
                            <div
                                className="above-middle"
                                onClick={clickOdaberi}
                            >
                                <p>Odaberi završenu utakmicu</p>
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
                                        setUtakmica_ID(0);
                                        setOznacena(false);
                                        setBluranoPocetna(true);
                                        setAktivniDomaci([]);
                                        setAktivniGosti([]);
                                        setStarteriSpremljeni(false);
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
                        {!blurano_pocetna && (
                            <OdabirPodatka
                                statistickiPodatci={statistickiPodatci}
                                statusi={statusi}
                                start={starteri_spremljeni ? false : true}
                                broj_startera={
                                    aktivni_domaci.length + aktivni_gosti.length
                                }
                                onSave={handleStarteriSave}
                                onSelect={handleOznaceniPodatak}
                                onConfirm={handleConfirm}
                                oznacenIgrac={Igrac_promjena}
                                zavrsena={zavrsena}
                            />
                        )}
                    </div>
                </div>
                <div className={`side ${blurano_pocetna ? 'blurred' : ''}`}>
                    {!blurano_pocetna && (
                        <>
                            <div className="p_logo">
                                <Logo
                                    imeMomcad={oznacenaUtakmica.GOSTI_NAZIV}
                                />
                                <p>{oznacenaUtakmica.GOSTI_NAZIV}</p>
                            </div>
                            {!starteri_spremljeni ? (
                                <DelegatIgraci
                                    igraci={igraci_gosti}
                                    start={true}
                                    onSelect={handleAktivniGosti}
                                />
                            ) : (
                                <DelegatIgraci
                                    igraci={aktivni_gosti}
                                    start={false}
                                    onSelectIgrac={handleOznacenIgrac}
                                    oznaceniIgrac={Igrac_promjena}
                                    izlaz={
                                        oznaceni_podatak == 'Ulaz/Izlaz'
                                            ? igraci_gosti
                                            : []
                                    }
                                    ulaziIgrac={Igrac_ulazi}
                                    setIgraci={setAktivniGosti}
                                    setIzlaz={setIgraciGosti}
                                    potvrdaPromjene={potvrdaPromjene}
                                    setPotvrdaPromjene={setPotvrdaPromjene}
                                />
                            )}
                        </>
                    )}
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
                                        items={lige}
                                        odabir="Odaberi ligu"
                                        onSelect={handleLiga}
                                    />
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
                                <button
                                    className="modal_button"
                                    onClick={handleSave}
                                >
                                    Spremi
                                </button>
                                {errorMessage && (
                                    <p className="dropdown_container_p">
                                        {errorMessage}
                                    </p>
                                )}
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
            {oznacena && statistika.length !== 0 ? (
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
            ) : oznacena ? (
                <div className="statistics">
                    <p>
                        Unesite statističke podatke kako biste ih ovdje vidjeli!
                    </p>
                </div>
            ) : null}
        </div>
    );
};

export default Delegat;
