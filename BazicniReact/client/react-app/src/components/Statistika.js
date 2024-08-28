import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/statistika.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Statistika = ({ imeIgrac, setPoeni, setStatistikaSezona }) => {
    const [igraci, setIgraci] = useState([]);
    const [imeSezone, setimeSezone] = useState('23/24');
    const [sezone, setSezone] = useState([]);
    const [oznaceniIgrac, setOznaceniIgrac] = useState('Odaberi igrača');
    const [oznacenaMomcad, setOznacenaMomcad] = useState('Odaberi momčad');
    const [izbor, setIzbor] = useState('Igrači');
    const [utakmice, setUtakmice] = useState([]);

    const columnsIgraci = [
        { short: 'NAZIV' },
        { short: 'MOMCAD' },
        { short: 'SUSRET' },
        { short: 'DATUM' },
        { short: 'MIN', full: 'ODIGRANO MINUTA' },
        { short: 'P', full: 'POENI' },
        { short: 'PIP', full: 'POGODCI IZ POLJA' },
        { short: 'PIPU', full: 'POKUŠAJI IZ POLJA' },
        { short: 'FG%', full: 'FG%' },
        { short: 'PT', full: 'POGOĐENE TRICE' },
        { short: 'PRT', full: 'PROMAŠENE TRICE' },
        { short: '3P%', full: '3P%' },
        { short: 'PSB', full: 'POGOĐENA SLOBODNA BACANJA' },
        { short: 'PRSB', full: 'PROMAŠENA SLOBODNA BACANJA' },
        { short: 'SB%', full: 'SB%' },
        { short: 'NS', full: 'NAPADAČKI SKOK' },
        { short: 'OS', full: 'OBRAMBENI SKOK' },
        { short: 'S', full: 'SKOKOVI' },
        { short: 'A', full: 'ASISTENCIJE' },
        { short: 'UL', full: 'UKRADENE LOPTE' },
        { short: 'B', full: 'BLOKOVI' },
    ];

    const columnsUtakmice = [
        { short: 'DOMACI' },
        { short: 'REZULTAT' },
        { short: 'GOSTI' },
        { short: 'SUDAC' },
        { short: 'DATUM' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.post(
                    'http://localhost:4000/getStatistikaIgraci',
                    { imeIgrac: imeIgrac ? imeIgrac : null }
                );
                setIgraci(result.data.igraci);
                setSezone(result.data.sezone);
                if (result.data.karijera)
                    setStatistikaSezona(result.data.karijera);

                const result1 = await axios.post(
                    'http://localhost:4000/getStatistikaMomcadi'
                );
                setUtakmice(result1.data.utakmice);
                console.log(result1.data.utakmice);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (imeIgrac && imeIgrac.length > 0) {
            setOznaceniIgrac(imeIgrac);

            let poeni = 0;
            let brojUtakmica = 0;
            igraci
                .filter((igrac) => igrac.IGRAC == imeIgrac)
                .forEach((igrac) => {
                    poeni += igrac.POENI;
                    brojUtakmica++;
                });
            if (brojUtakmica !== 0) setPoeni(poeni / brojUtakmica);
        }
    }, [igraci]);

    return (
        <div className="statistikaPage">
            {!imeIgrac && (
                <div className="statistikaVrh">
                    <p className="statistika_naslov">
                        {imeIgrac && imeIgrac.length > 0
                            ? 'Statistika na svim utakmicama'
                            : 'NBA Statistika'}
                    </p>
                    <div className="statistikaSlika">
                        <img
                            src="/Proba.webp"
                            style={{
                                zIndex: '1',
                                position: 'relative',
                                display: 'block',
                                width: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="statistika_container">
                <div className="statistika_menu">
                    <div className="statistika_form">
                        <form>
                            <p className="sezona_text">SEZONA</p>
                            <select
                                value={imeSezone}
                                onChange={(e) => setimeSezone(e.target.value)}
                            >
                                {sezone.map((sezona, index) => (
                                    <option key={index} value={sezona}>
                                        {sezona}
                                    </option>
                                ))}
                            </select>
                        </form>
                        {!imeIgrac && (
                            <form>
                                <p className="sezona_text">IGRAČI / UTAKMICE</p>
                                <select
                                    value={izbor}
                                    onChange={(e) => {
                                        setIzbor(e.target.value);
                                        setOznacenaMomcad('Odaberi momčad');
                                        setOznaceniIgrac('Odaberi igrača');
                                    }}
                                >
                                    {['Igrači', 'Utakmice'].map(
                                        (izbor, index) => (
                                            <option key={index} value={izbor}>
                                                {izbor}
                                            </option>
                                        )
                                    )}
                                </select>
                            </form>
                        )}
                        {!imeIgrac && izbor == 'Igrači' ? (
                            <form>
                                <p className="sezona_text">IGRAČ</p>
                                <select
                                    value={oznaceniIgrac}
                                    onChange={(e) =>
                                        setOznaceniIgrac(e.target.value)
                                    }
                                >
                                    {[
                                        'Odaberi igrača',
                                        ...new Set(
                                            igraci.map((item) => item.IGRAC)
                                        ),
                                    ].map((igrac, index) => (
                                        <option key={index} value={igrac}>
                                            {igrac}
                                        </option>
                                    ))}
                                </select>
                            </form>
                        ) : (
                            !imeIgrac &&
                            izbor == 'Utakmice' && (
                                <form>
                                    <p className="sezona_text">MOMČAD</p>
                                    <select
                                        value={oznacenaMomcad}
                                        onChange={(e) =>
                                            setOznacenaMomcad(e.target.value)
                                        }
                                    >
                                        {[
                                            'Odaberi momčad',
                                            ...new Set(
                                                utakmice.map(
                                                    (item) =>
                                                        item.DOMACI_NAZIV ||
                                                        item.GOSTI_NAZIV
                                                )
                                            ),
                                        ].map((momčad, index) => (
                                            <option key={index} value={momčad}>
                                                {momčad}
                                            </option>
                                        ))}
                                    </select>
                                </form>
                            )
                        )}
                    </div>
                    {!imeIgrac && izbor == 'Utakmice' ? (
                        <div className="tablicaStat">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {columnsUtakmice.map(
                                            (column, columnIndex) => (
                                                <th
                                                    key={columnIndex}
                                                    className="tooltip-container"
                                                >
                                                    <span className="short">
                                                        {column.short}
                                                    </span>
                                                    {column.full && (
                                                        <span className="full">
                                                            {column.full}
                                                        </span>
                                                    )}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {utakmice
                                        .filter((rowItem) => {
                                            return (
                                                rowItem.SEZONA == imeSezone &&
                                                (oznacenaMomcad ==
                                                    'Odaberi momčad' ||
                                                    rowItem.DOMACI_NAZIV ==
                                                        oznacenaMomcad ||
                                                    rowItem.GOSTI_NAZIV ==
                                                        oznacenaMomcad)
                                            );
                                        })
                                        .map((rowItem, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {Object.values(rowItem)
                                                    .slice(0, -7)
                                                    .map((row, rowInd) => (
                                                        <React.Fragment
                                                            key={rowInd}
                                                        >
                                                            {rowInd === 0 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={`/Momcad/${rowItem.DOMACI_NAZIV}`}
                                                                    >
                                                                        {
                                                                            rowItem.DOMACI_NAZIV
                                                                        }
                                                                    </Link>
                                                                </td>
                                                            ) : rowInd === 1 ? (
                                                                <td
                                                                    key={rowInd}
                                                                >
                                                                    {rowItem.POENI_DOMACI +
                                                                        ' : ' +
                                                                        rowItem.POENI_GOSTI}
                                                                </td>
                                                            ) : rowInd === 2 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={`/Momcad/${rowItem.GOSTI_NAZIV}`}
                                                                    >
                                                                        {
                                                                            rowItem.GOSTI_NAZIV
                                                                        }
                                                                    </Link>
                                                                </td>
                                                            ) : rowInd === 4 ? (
                                                                <td
                                                                    key={rowInd}
                                                                >
                                                                    {
                                                                        rowItem.DATUM_UTAKMICE
                                                                    }
                                                                </td>
                                                            ) : (
                                                                <td
                                                                    key={rowInd}
                                                                >
                                                                    {row}
                                                                </td>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="tablicaStat">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        {columnsIgraci.map(
                                            (column, columnIndex) => (
                                                <th
                                                    key={columnIndex}
                                                    className="tooltip-container"
                                                >
                                                    <span className="short">
                                                        {column.short}
                                                    </span>
                                                    {column.full && (
                                                        <span className="full">
                                                            {column.full}
                                                        </span>
                                                    )}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {igraci
                                        .filter((rowItem) => {
                                            return (
                                                rowItem.SEZONA == imeSezone &&
                                                (oznaceniIgrac ===
                                                    'Odaberi igrača' ||
                                                    rowItem.IGRAC ===
                                                        oznaceniIgrac)
                                            );
                                        })
                                        .map((rowItem, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {Object.values(rowItem)
                                                    .slice(0, -3)
                                                    .map((row, rowInd) => (
                                                        <React.Fragment
                                                            key={rowInd}
                                                        >
                                                            {rowInd === 0 ||
                                                            rowInd === 1 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={
                                                                            rowInd ===
                                                                            0
                                                                                ? `/Igrac/${row}`
                                                                                : `/Momcad/${rowItem.IGRACMOMCAD}`
                                                                        }
                                                                        state={{
                                                                            imeMomcad:
                                                                                rowItem.IGRACMOMCAD,
                                                                        }}
                                                                    >
                                                                        {row}
                                                                    </Link>
                                                                </td>
                                                            ) : rowInd === 2 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={`/Momcad/${rowItem.DOMACI_IME}`}
                                                                    >
                                                                        {
                                                                            rowItem.DOMACI
                                                                        }
                                                                    </Link>
                                                                    <span>
                                                                        {' '}
                                                                        vs.{' '}
                                                                    </span>
                                                                    <Link
                                                                        to={`/Momcad/${rowItem.GOSTI_IME}`}
                                                                    >
                                                                        {
                                                                            rowItem.GOSTI
                                                                        }
                                                                    </Link>
                                                                </td>
                                                            ) : rowInd === 3 ||
                                                              rowInd ===
                                                                  4 ? null : (
                                                                <td
                                                                    key={rowInd}
                                                                >
                                                                    {row}
                                                                </td>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Statistika;
