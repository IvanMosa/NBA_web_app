import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/statistika.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Statistika() {
    const [igraci, setIgraci] = useState([]);
    const [imeSezone, setimeSezone] = useState('23/24');
    const [sezone, setSezone] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios.post(
                    'http://localhost:4000/getStatistikaIgraci'
                );
                setIgraci(result.data.igraci);
                setSezone(result.data.sezone);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="statistika_container">
            <p className="statistika_naslov">Statistika igrača</p>
            <div className="statistika_menu">
                <form>
                    <p className="sezona_text">Sezona</p>
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
                <table className="data-table">
                    <thead>
                        <tr>
                            {[
                                'NAZIV',
                                'MOMCAD',
                                'SUSRET',
                                'DATUM UTAKMICE',
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
                                'NAPADAČKI SKOK',
                                'OBRAMBENI SKOK',
                                'SKOKOVI',
                                'ASISTENCIJE',
                                'UKRADENE LOPTE',
                                'BLOKOVI',
                            ].map((column, columnIndex) => (
                                <th key={columnIndex}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {igraci
                            .filter((rowItem) => {
                                return rowItem.SEZONA == imeSezone;
                            })
                            .map((rowItem, rowIndex) => (
                                <tr key={rowIndex}>
                                    {Object.values(rowItem)
                                        .slice(0, -3)
                                        .map((row, rowInd) => (
                                            <React.Fragment key={rowInd}>
                                                {rowInd === 0 ||
                                                rowInd === 1 ? (
                                                    <td className="table_link">
                                                        <Link
                                                            to={
                                                                rowInd === 0
                                                                    ? `/Igrac/${row}`
                                                                    : `/Momcad/${rowItem.DOMACI_IME}`
                                                            }
                                                        >
                                                            {row}
                                                        </Link>
                                                    </td>
                                                ) : rowInd === 2 ? (
                                                    <td className="table_link">
                                                        <Link
                                                            to={`/Momcad/${rowItem.DOMACI_IME}`}
                                                        >
                                                            {rowItem.DOMACI}
                                                        </Link>
                                                        <span> vs. </span>
                                                        <Link
                                                            to={`/Momcad/${rowItem.GOSTI_IME}`}
                                                        >
                                                            {rowItem.GOSTI}
                                                        </Link>
                                                    </td>
                                                ) : (
                                                    <td key={rowInd}>{row}</td>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Statistika;
