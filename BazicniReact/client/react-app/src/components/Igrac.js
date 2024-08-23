import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Logo from './library_css/Logo';
import './css/igrac.css';
import axios from 'axios';
import Statistika from './Statistika';

function Igrac() {
    const location = useLocation();
    const { imeIgrac } = useParams();
    const [podatci, setPodatci] = useState(location.state?.rowItem || null);
    const imeMomcad = location.state?.imeMomcad || null;
    const [poeni, setPoeni] = useState(0.0);
    const [dominantColor, setDominantColor] = useState(null);
    const [darkDominantColor, setDarkDominantColor] = useState(null);

    const prikaziPodatke = async () => {
        let podatci;
        try {
            console.log('usao');
            const result = await axios.post(
                'http://localhost:4000/podatciIgraca',
                {
                    imeIgrac: imeIgrac,
                }
            );

            console.log(result.data.podatci);
            podatci = result.data.podatci;
        } catch (err) {
            console.log(err);
        } finally {
            return podatci;
        }
    };

    useEffect(() => {
        if (!podatci) {
            prikaziPodatke().then((data) => setPodatci(data));
            console.log(podatci);
        }
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
                        src={`/${imeIgrac}.webp`}
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
                        <h4>TEŽINA</h4>
                        <h5>{podatci && podatci[10]}kg</h5>
                    </div>
                </div>
            </div>
            <div className="statistikaIgrac">
                <Statistika imeIgrac={imeIgrac} setPoeni={setPoeni} />
            </div>
        </div>
    );
}

export default Igrac;
