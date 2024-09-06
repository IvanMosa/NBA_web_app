import * as React from 'react';
import { useState, useEffect } from 'react';
import api from '../api';
import '../components/css/trade.css';
import Logo from './library_css/Logo';

const Trade = ({ token }) => {
    const [momcad1, setMomcad1] = useState(' ');
    const [momcad2, setMomcad2] = useState(' ');
    const [igrac1, setIgrac1] = useState(' ');
    const [igrac2, setIgrac2] = useState(' ');
    const [momcadi, setMomcadi] = useState([]);
    const [igraci_1, setIgraci_1] = useState([]);
    const [igraci_2, setIgraci_2] = useState([]);
    const [DoubleTrade, setDoubleTrade] = useState(false);
    const [TradeAccepted, setTradeAccepted] = useState(true);
    const [ErrorMessage, setErrorMessage] = useState('');
    const [datum_igrac, setDatumIgrac] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            const result = await api.post(
                '/getMomcadi',
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            const momcadTemp = Array.isArray(result.data.momcad)
                ? result.data.momcad
                : [];
            setMomcadi(['Odaberi momcad', ...momcadTemp]);
            setMomcad1('Odaberi momcad');
            setMomcad2('Odaberi momcad');
            setIgraci_1(['Odaberi momcad za prikaz']);
            setIgraci_2(['Odaberi momcad za prikaz']);
            setIgrac1('Odaberi igraca');
            setIgrac2('Odaberi igraca');
            setErrorMessage('');
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setErrorMessage('');
            if (
                momcad1 != 'Odaberi momcad' &&
                momcad2 != 'Odaberi momcad' &&
                momcad1 != momcad2
            ) {
                setErrorMessage('');
                const result1 = await api.post(
                    '/showRosterTrade',
                    {
                        imeMomcad: momcad1,
                        imeMomcad1: momcad2,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                const igraci1_temp = Array.isArray(result1.data.igraci_1)
                    ? result1.data.igraci_1
                    : [];

                const igraci2_temp = Array.isArray(result1.data.igraci_2)
                    ? result1.data.igraci_2
                    : [];

                setIgraci_1(['Odaberi igraca', ...igraci1_temp]);
                setIgraci_2(['Odaberi igraca', ...igraci2_temp]);
            } else if (momcad1 == momcad2) {
                setErrorMessage('Momcadi moraju biti razlicite!');
            } else if (momcad1 != 'Odaberi momcad') {
                const result1 = await api.post(
                    '/showRosterTrade',
                    {
                        imeMomcad: momcad1,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                const igraci1_temp = Array.isArray(result1.data.igraci_1)
                    ? result1.data.igraci_1
                    : [];
                setIgraci_1(['Odaberi igraca', ...igraci1_temp]);
            } else if (momcad2 != 'Odaberi momcad') {
                const result1 = await api.post(
                    '/showRosterTrade',
                    {
                        imeMomcad1: momcad2,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );
                const igraci2_temp = Array.isArray(result1.data.igraci_2)
                    ? result1.data.igraci_2
                    : [];
                setIgraci_2(['Odaberi igraca', ...igraci2_temp]);
            }

            if (momcad1 == 'Odaberi momcad') {
                setIgraci_1(['Odaberi momcad za prikaz']);
                setErrorMessage(
                    'Oznaci drugu momcad kako bi trade bio omogucen!'
                );
            }
            if (momcad2 == 'Odaberi momcad') {
                setIgraci_2(['Odaberi momcad za prikaz']);
                setErrorMessage(
                    'Oznaci drugu momcad kako bi trade bio omogucen!'
                );
            }
            if (igrac1 == 'Odaberi igraca') {
                setErrorMessage('Oznaci igrace kako bi trade bio omogucen!');
            }
            if (igrac2 == 'Odaberi igraca') {
                setErrorMessage('Oznaci igrace kako bi trade bio omogucen!');
            }
        };
        fetchData();
    }, [momcad1, momcad2, igrac1, igrac2]);

    const handleSubmit = async () => {
        if (
            igrac1 == 'Odaberi igraca' ||
            igrac1 == 'Odaberi momcad za prikaz'
        ) {
            setTradeAccepted(false);
            setErrorMessage('Oznaci igraca!');
        }
        if (momcad1 == 'Odaberi momcad' || momcad2 == 'Odaberi momcad') {
            setTradeAccepted(false);
        }

        if (TradeAccepted) {
            const result = await api.post(
                '/insertTrade',
                {
                    igrac1: igrac1,
                    igrac2: igrac2,
                    momcad1: momcad1,
                    momcad2: momcad2,
                    datum_igrac: datum_igrac,
                },
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            setErrorMessage(result.data.message);
        }
    };

    return (
        <div className="trade_container">
            <div className="trade_div">
                <div className="form_div">
                    <form>
                        <select
                            value={momcad1}
                            onChange={(e) => setMomcad1(e.target.value)}
                        >
                            {momcadi.map((item, index) => (
                                <option key={index}>
                                    <Logo
                                        imeMomcad={item}
                                        none={true}
                                        home={true}
                                    />
                                    {item}
                                </option>
                            ))}
                        </select>
                        <select
                            value={igrac1}
                            onChange={(e) => setIgrac1(e.target.value)}
                        >
                            {igraci_1.map((item, index) => (
                                <option key={index}>{item}</option>
                            ))}
                        </select>
                    </form>
                </div>
                <div className="form_div">
                    <input
                        type="date"
                        placeholder="Upišite datum trade-a"
                        value={datum_igrac}
                        onChange={(e) => setDatumIgrac(e.target.value)}
                    />
                </div>
                <div className="form_div">
                    <form>
                        <select
                            value={momcad2}
                            onChange={(e) => setMomcad2(e.target.value)}
                        >
                            {momcadi.map((item, index) => (
                                <option key={index}>{item}</option>
                            ))}
                        </select>
                        <select
                            value={igrac2}
                            onChange={(e) => {
                                setIgrac2(e.target.value);
                                if (
                                    igrac2 != 'Odaberi igraca' ||
                                    igrac2 != 'Odaberi momcad za prikaz'
                                )
                                    setDoubleTrade(true);
                            }}
                        >
                            {igraci_2.map((item, index) => (
                                <option key={index}>{item}</option>
                            ))}
                        </select>
                    </form>
                </div>
            </div>
            <div className="trade_confirm">
                {ErrorMessage ? (
                    <p>{ErrorMessage}</p>
                ) : (
                    <div className="trade_button">
                        <button type="button" onClick={handleSubmit}>
                            Posalji
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Trade;
