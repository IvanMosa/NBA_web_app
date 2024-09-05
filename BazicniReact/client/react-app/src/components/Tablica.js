import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/tablica.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Tablica = ({ token }) => {
    const [FilteredData, setFilteredData] = useState([]);
    const [imeSezone, setimeSezone] = useState(' ');
    const [Konferencija_Divizija, setKonferencija_Divizija] = useState(' ');
    const [Konf, setKonf] = useState([]);
    const [Div, setDiv] = useState([]);
    const [izbor, setIzbor] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const konfdiv = ['Konferencija', 'Divizija'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:4000/getMomcadi',
                    {},
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                setSeasons(
                    Array.isArray(response.data.sezona)
                        ? response.data.sezona
                        : []
                );
                setKonf(
                    Array.isArray(response.data.konf) ? response.data.konf : []
                );
                setDiv(
                    Array.isArray(response.data.div) ? response.data.div : []
                );
                setIzbor(
                    Array.isArray(response.data.konf) ? response.data.konf : []
                );
                setKonferencija_Divizija('Konferencija');
                setimeSezone('23/24');

                const response1 = await axios.post(
                    'http://localhost:4000/ShowMomcadi',
                    {
                        imeSezone: '23/24',
                        konf_div: 'Konferencija',
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                setFilteredData(
                    Array.isArray(response1.data) ? response1.data : []
                );
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (Konferencija_Divizija === 'Konferencija') {
                setIzbor(Konf);
            } else if (Konferencija_Divizija === 'Divizija') {
                setIzbor(Div);
            }
            try {
                const response = await axios.post(
                    'http://localhost:4000/ShowMomcadi',
                    {
                        //imeMomcad: imeMomcad,
                        imeSezone: imeSezone,
                        konf_div: Konferencija_Divizija,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                setFilteredData(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [imeSezone, Konferencija_Divizija]);

    return (
        <div className="tablicaPage">
            <div className="query_container">
                <h1 className="query_title">Poredak</h1>
                <div className="dropdown_menu">
                    <form>
                        <select
                            value={imeSezone}
                            onChange={(e) => setimeSezone(e.target.value)}
                        >
                            {seasons.map((season, index) => (
                                <option key={index} value={season}>
                                    {season}
                                </option>
                            ))}
                        </select>
                        <select
                            value={Konferencija_Divizija}
                            onChange={(e) =>
                                setKonferencija_Divizija(e.target.value)
                            }
                        >
                            {konfdiv.map((item, index) => (
                                <option key={index} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </form>
                    {izbor.map((item, index) => (
                        <div key={index}>
                            <p className="izbor">{item}</p>
                            {FilteredData.length > 0 ? (
                                <table className="data-table1">
                                    <thead>
                                        <tr>
                                            {[
                                                'NAZIV',
                                                'BROJ POBJEDA',
                                                'BROJ PORAZA',
                                                'PLASMAN',
                                            ].map((header, collumnIndex) => (
                                                <th key={collumnIndex}>
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {FilteredData.filter((rowItem) => {
                                            const lastCell =
                                                rowItem[rowItem.length - 1];
                                            return lastCell.includes(item);
                                        }).map((rowItem, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {rowItem
                                                    .slice(0, 4)
                                                    .map((value, cellIndex) => (
                                                        <React.Fragment
                                                            key={cellIndex}
                                                        >
                                                            {cellIndex === 0 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={`/Momcad/${value}`}
                                                                    >
                                                                        {value}
                                                                    </Link>
                                                                </td>
                                                            ) : (
                                                                <td>{value}</td>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No data available</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Tablica;
