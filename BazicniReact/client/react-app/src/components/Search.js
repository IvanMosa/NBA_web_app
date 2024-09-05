import React, { useEffect, useState } from 'react';
import '../components/css/search.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Logo from './library_css/Logo';

function Search({ token, roles = [] }) {
    const [searchType, setSearchType] = useState(
        roles.includes('PREGLED') || roles == 'ADMIN' ? 'igraci' : 'momcadi'
    );
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [igraci, setIgraci] = useState([]);
    const [momcadi, setMomcadi] = useState([]);

    const [hoverIgraci, setHoverIgraci] = useState(false);
    const [clickIgraci, setClickIgraci] = useState(
        searchType === 'igraci' ? true : false
    );
    const [hoverMomcadi, setHoverMomcadi] = useState(false);
    const [clickMomcadi, setClickMomcadi] = useState(
        searchType === 'momcadi' ? true : false
    );

    const igraciKolone = [
        { ime: 'NAZIV', stil: 'left' },
        { ime: 'MOMCAD' },
        { ime: 'BROJ DRESA' },
        { ime: 'POZICIJA' },
        { ime: 'VISINA' },
        { ime: 'DRŽAVLJANSTVO' },
    ];
    const momcadKolone = [
        { ime: 'NAZIV', stil: 'left' },
        { ime: 'TRENER' },
        { ime: 'DATUM OSNIVANJA' },
        { ime: 'GRAD' },
        { ime: 'STADION' },
    ];
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.post(
                    'http://localhost:4000/podatciSearch',
                    {},
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                setIgraci(result.data.igraci);
                setMomcadi(result.data.momcadi);
                if (searchType === 'igraci') setResults(result.data.igraci);
                else setResults(result.data.momcadi);
            } catch (err) {
                console.log(err);
            }
        };
        if (igraci.length === 0 || momcadi.length === 0) {
            fetchData();
        }
    }, []);

    useEffect(() => {
        if (searchType == 'igraci') {
            setResults(igraci);
        } else if (searchType == 'momcadi') {
            setResults(momcadi);
        }
    }, [searchType]);

    const filteredResults =
        query === ''
            ? results
            : results.filter((item) => {
                  return searchType === 'igraci'
                      ? item.IGRAC.toLowerCase().includes(query.toLowerCase())
                      : item.MOMCAD.toLowerCase().includes(query.toLowerCase());
              });

    const brojPage = Math.ceil(filteredResults.length / 50);
    const startIndex = (page - 1) * 50;
    const endIndex = searchType === 'igraci' ? startIndex + 50 : results.length;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    return (
        <div className="searchPage">
            <div className="searchContainer">
                <div className="searchNaslov">
                    <h1>PRETRAŽIVAČ</h1>
                    <input
                        type="text"
                        placeholder="Traži"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="searchOdabir">
                    <div className="searchControls">
                        {(roles.includes('PREGLED') || roles == 'ADMIN') && (
                            <button
                                onClick={() => {
                                    setSearchType('igraci');
                                    setHoverIgraci(false);
                                    setHoverMomcadi(false);
                                    setClickMomcadi(false);
                                    setClickIgraci(true);
                                }}
                                onMouseEnter={() => setHoverIgraci(true)}
                                onMouseLeave={() =>
                                    clickMomcadi && setHoverIgraci(false)
                                }
                                className={
                                    !clickMomcadi && clickIgraci
                                        ? 'oznacen'
                                        : ''
                                }
                                style={{
                                    borderBottom: hoverIgraci
                                        ? '3px solid black'
                                        : '',
                                }}
                            >
                                Igrači
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setSearchType('momcadi');
                                setHoverIgraci(false);
                                setHoverMomcadi(false);
                                setClickMomcadi(true);
                                setClickIgraci(false);
                            }}
                            onMouseEnter={() => setHoverMomcadi(true)}
                            onMouseLeave={() =>
                                clickIgraci && setHoverMomcadi(false)
                            }
                            className={
                                clickMomcadi && !clickIgraci ? 'oznacen' : ''
                            }
                            style={{
                                borderBottom: hoverMomcadi
                                    ? '3px solid black'
                                    : '',
                            }}
                        >
                            Momčadi
                        </button>
                    </div>

                    {searchType === 'igraci' && results.length > 50 && (
                        <div className="pagination">
                            <h3>
                                {filteredResults.length}{' '}
                                {filteredResults.length > 1
                                    ? 'Igrača'
                                    : 'Igrač'}
                            </h3>
                            •
                            <h3>
                                Stranica: {page} od {brojPage}
                            </h3>
                            {filteredResults.length > 50 && (
                                <>
                                    •
                                    <div className="paginationButtons">
                                        <button
                                            onClick={() =>
                                                handlePageChange(page - 1)
                                            }
                                            disabled={page === 1}
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handlePageChange(page + 1)
                                            }
                                            disabled={
                                                endIndex >=
                                                filteredResults.length
                                            }
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="searchTablica">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {(searchType == 'igraci'
                                    ? igraciKolone
                                    : momcadKolone
                                ).map((kolona, index) => (
                                    <th
                                        key={index}
                                        style={{ textAlign: kolona.stil }}
                                    >
                                        {kolona.ime}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedResults.map((result, index) => (
                                <tr key={index}>
                                    <td
                                        className="searchLink"
                                        style={{ textAlign: 'left' }}
                                    >
                                        {searchType == 'igraci' ? (
                                            <>
                                                <Link
                                                    to={`/Igrac/${result.IGRAC}`}
                                                >
                                                    <div className="igrac-container">
                                                        <img
                                                            src={`/Slike igraca/${result.IGRAC}.webp`}
                                                            alt={`${result.IGRAC} picture`}
                                                            className="player-image"
                                                            onError={(e) => {
                                                                e.target.onerror =
                                                                    null;
                                                                e.target.src =
                                                                    '/Slike igraca/default.png';
                                                            }}
                                                        />
                                                    </div>

                                                    {result.IGRAC}
                                                </Link>
                                            </>
                                        ) : (
                                            <Link
                                                to={`/Momcad/${result.MOMCAD}`}
                                            >
                                                <div className="logo-container">
                                                    <Logo
                                                        imeMomcad={
                                                            result.MOMCAD
                                                        }
                                                        klasa={'player-image'}
                                                    />
                                                </div>
                                                {result.MOMCAD}
                                            </Link>
                                        )}
                                    </td>
                                    <td className="searchLink">
                                        {searchType == 'igraci' ? (
                                            <Link
                                                to={`/Momcad/${result.MOMCAD}`}
                                            >
                                                {result.KRATICA}
                                            </Link>
                                        ) : (
                                            <>{result.TRENER}</>
                                        )}
                                    </td>
                                    <td>
                                        {searchType == 'igraci' ? (
                                            <>{result.BROJ_DRESA}</>
                                        ) : (
                                            <>{result.DATUM_OSNIVANJA}</>
                                        )}
                                    </td>
                                    <td>
                                        {searchType == 'igraci' ? (
                                            <>{result.POZICIJA}</>
                                        ) : (
                                            <>{result.GRAD}</>
                                        )}
                                    </td>
                                    <td>
                                        {searchType == 'igraci' ? (
                                            <>{result.VISINA}</>
                                        ) : (
                                            <>{result.STADION}</>
                                        )}
                                    </td>
                                    <td>
                                        {searchType == 'igraci' ? (
                                            <>{result.DRZAVA}</>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Search;
