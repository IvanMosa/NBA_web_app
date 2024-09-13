import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Logo from './library_css/Logo';
import './css/igrac.css';
import api from '../api';
import Statistika from './Statistika';
import { Link } from 'react-router-dom';
import KarijeraMomcadi from './library_css/karijeraMomcadi';

function Igrac({ token }) {
    const location = useLocation();
    const { imeIgrac } = useParams();
    const [podatci, setPodatci] = useState(location.state?.rowItem || null);
    const [ugovoriIgrac, setUgovoriIgrac] = useState(null);
    const [imeMomcad, setImeMomcad] = useState(
        location.state?.imeMomcad || null
    );
    const [poeni, setPoeni] = useState(0.0);
    const [dominantColor, setDominantColor] = useState(null);
    const [darkDominantColor, setDarkDominantColor] = useState(null);
    const [statistika, setStatistika] = useState(true);
    const [karijera, setKarijera] = useState(false);
    const [hoverStatistika, setHoverStatistika] = useState(true);
    const [hoverKarijera, setHoverKarijera] = useState(false);
    const [statistikaSezona, setStatistikaSezona] = useState(null);

    const prikaziPodatke = async () => {
        let podatci;
        let ugovoriIgrac;
        try {
            const result = await api.post('/podatciIgraca', {
                imeIgrac: imeIgrac,
            });

            if (imeMomcad === null) {
                setImeMomcad(result.data.podatci[11]);
            }
            podatci = result.data.podatci;
            ugovoriIgrac = result.data.ugovoriIgraca;
        } catch (err) {
            console.log(err);
        } finally {
            return { podatci: podatci, ugovoriIgrac: ugovoriIgrac };
        }
    };

    useEffect(() => {
        if (!podatci || !ugovoriIgrac)
            prikaziPodatke().then((data) => {
                setPodatci(data.podatci);
                setUgovoriIgrac(data.ugovoriIgrac);
            });
    }, [podatci]);

    const parseRgba = (rgbaString) => {
        const regex =
            /^rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d.]+)\s*\)$/;
        const match = rgbaString.match(regex);

        if (match) {
            const [_, r, g, b, a] = match.map(Number);
            return { r, g, b, a };
        } else {
            throw new Error('Invalid RGBA string');
        }
    };
    useEffect(() => {
        if (dominantColor) {
            try {
                const { r, g, b } = parseRgba(dominantColor);
                setDarkDominantColor(`rgba(${r}, ${g}, ${b}, 1)`);
            } catch (error) {
                console.error('Error parsing color:', error.message);
            }
        }
    }, [dominantColor]);
    return (
        <div className="igrac_page">
            <div className="igrac_container">
                <div
                    className="igrac"
                    style={{
                        backgroundColor: `${
                            dominantColor ? dominantColor : 'gray'
                        }`,
                    }}
                >
                    <Logo
                        imeMomcad={imeMomcad}
                        setDominantColor={setDominantColor}
                        style={{
                            left: '10rem',
                            top: '1rem',
                            position: 'absolute',
                        }}
                    />
                    <img
                        src={`/Slike igraca/${imeIgrac}.webp`}
                        alt={`${imeIgrac} picture`}
                        style={{
                            height: 'auto',
                            width: '22vw',
                            left: '20rem',
                            position: 'absolute',
                            bottom: '0px',
                        }}
                    />
                    <div className="podatciIgrac">
                        <h4 className="podatci">
                            {imeMomcad} | #{podatci && podatci[5]} |{' '}
                            {podatci && podatci[3]}
                        </h4>
                        <h2 className="igrac_naslov">
                            {imeIgrac.toUpperCase()}
                        </h2>
                    </div>
                </div>
                <div
                    className="visePodataka"
                    style={{
                        backgroundColor: `${
                            darkDominantColor ? darkDominantColor : 'black'
                        }`,
                    }}
                >
                    <div className="podatak">
                        <h4>DATUM ROĐENJA</h4>
                        <h5>{podatci && podatci[8]}</h5>
                    </div>
                    <div className="podatak">
                        <h4>DRŽAVLJANSTVO</h4>
                        <h5>{podatci && podatci[2]}</h5>
                    </div>
                    <div className="podatak">
                        <h4>POENI PO UTAKMICAMA</h4>
                        <h5>{poeni.toFixed(1)}</h5>
                    </div>
                    <div className="podatak">
                        <h4>DRAFT</h4>
                        <h5>{podatci && podatci[9]}</h5>
                    </div>
                    <div className="podatak">
                        <h4>VISINA</h4>
                        <h5>{podatci && podatci[1]}m</h5>
                    </div>
                    <div className="podatak">
                        <h4>TEŽINA</h4>
                        <h5>
                            {podatci && podatci[10]}kg (
                            {podatci && (podatci[10] * 2.2).toFixed(1)}lbs)
                        </h5>
                    </div>
                </div>
            </div>
            <div className="statistikaKarijeraIgrac">
                <div className="izborNavigacija">
                    <div className="izborIgrac">
                        <button
                            onClick={() => {
                                setStatistika(true);
                                setKarijera(false);
                                setHoverKarijera(false);
                                setHoverStatistika(true);
                            }}
                            onMouseEnter={() => setHoverStatistika(true)}
                            onMouseLeave={() =>
                                karijera && setHoverStatistika(false)
                            }
                            className={statistika && !karijera ? 'oznacen' : ''}
                            style={{
                                borderBottom: hoverStatistika
                                    ? '3px solid black'
                                    : '',
                            }}
                        >
                            Statistika
                        </button>
                        <button
                            onClick={() => {
                                setKarijera(true);
                                setStatistika(false);
                                setHoverKarijera(true);
                                setHoverStatistika(false);
                            }}
                            onMouseEnter={() => setHoverKarijera(true)}
                            onMouseLeave={() =>
                                statistika && setHoverKarijera(false)
                            }
                            className={!statistika && karijera ? 'oznacen' : ''}
                            style={{
                                borderBottom: hoverKarijera
                                    ? '3px solid black'
                                    : '',
                            }}
                        >
                            Karijera
                        </button>
                    </div>
                </div>
                {statistika && !karijera && (
                    <div className="statistikaIgrac">
                        <Statistika
                            imeIgrac={imeIgrac}
                            setPoeni={setPoeni}
                            setStatistikaSezona={setStatistikaSezona}
                            token={token}
                        />
                    </div>
                )}
                {!statistika && karijera && (
                    <div className="karijeraIgrac">
                        <div className="karijeraIgracMomcadi">
                            <KarijeraMomcadi
                                ugovoriIgrac={ugovoriIgrac}
                                statistikaSezona={statistikaSezona}
                            />
                        </div>
                        <div className="karijeraContainer">
                            <div className="karijeraKomponenta">
                                <div className="karijeraNaslov">
                                    Karijera igrača
                                </div>
                                <div className="karijeraTablica">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                {[
                                                    'RAZDOBLJE',
                                                    'MOMČAD',
                                                    'BROJ UTAKMICA',
                                                    'MINUTE',
                                                    'POENI',
                                                    'POGODCI IZ POLJA',
                                                    'POKUŠAJI IZ POLJA',
                                                    'FG%',
                                                    'POGOĐENE TRICE',
                                                    'PROMAŠENE TRICE',
                                                    '3P%',
                                                    'POGOĐENA SLOBODNA BACANJA',
                                                    'PROMAŠENA SLOBODNA BACANJA',
                                                    'SB%',
                                                ].map((column, columnIndex) => (
                                                    <th key={columnIndex}>
                                                        {column}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ugovoriIgrac.map(
                                                (ugovor, index) => {
                                                    const startYear = parseInt(
                                                        ugovor.DATUM_OD
                                                    );

                                                    const endYear =
                                                        ugovor.DATUM_DO === null
                                                            ? new Date().getFullYear()
                                                            : parseInt(
                                                                  ugovor.DATUM_DO +
                                                                      2000
                                                              );

                                                    const rows = [];

                                                    for (
                                                        let year = startYear;
                                                        year <= endYear;
                                                        year++
                                                    ) {
                                                        const season = `${String(
                                                            year
                                                        ).slice(-2)}/${String(
                                                            year + 1
                                                        ).slice(-2)}`;

                                                        const sezonaPrikaz = `${String(
                                                            year
                                                        ).slice(-2)}-${String(
                                                            year + 1
                                                        ).slice(-2)}`;

                                                        const statsForSeason =
                                                            statistikaSezona.find(
                                                                (stat) =>
                                                                    stat.SEZONA ==
                                                                        season &&
                                                                    stat.IGRACMOMCADKRATICA ==
                                                                        ugovor.KRATICA
                                                            );

                                                        if (statsForSeason) {
                                                            const MINUTE =
                                                                statsForSeason.MINUTE /
                                                                statsForSeason.BROJUTAKMICA;
                                                            const minutes =
                                                                MINUTE / 60;

                                                            rows.unshift(
                                                                <tr
                                                                    key={`${ugovor.NAZIV}-${season}`}
                                                                >
                                                                    <td>{`${sezonaPrikaz}`}</td>
                                                                    <td className="igracLink">
                                                                        <Link
                                                                            to={`/Momcad/${ugovor.NAZIV}`}
                                                                        >
                                                                            {
                                                                                ugovor.KRATICA
                                                                            }
                                                                        </Link>
                                                                    </td>
                                                                    <td>
                                                                        {
                                                                            statsForSeason.BROJUTAKMICA
                                                                        }
                                                                    </td>
                                                                    <td>
                                                                        {minutes.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.POENI.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.POGODCI_IZ_POLJA.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.POKUSAJI_IZ_POLJA.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {(
                                                                            statsForSeason.PP *
                                                                            100
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.SUT_ZA_3_POGODEN.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.SUT_ZA_3_PROMASEN.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {(
                                                                            statsForSeason.TRI_P *
                                                                            100
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.SLOBODNA_BACANJA_POGODENA.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {statsForSeason.SLOBODNA_BACANJA_PROMASENA.toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {(
                                                                            statsForSeason.SB *
                                                                            100
                                                                        ).toFixed(
                                                                            1
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    }

                                                    return rows;
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Igrac;
