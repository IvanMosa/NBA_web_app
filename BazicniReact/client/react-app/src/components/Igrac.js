import * as React from 'react';
import { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Logo from './library_css/Logo';
import './css/igrac.css';
import Statistika from './Statistika';

function Igrac() {
    const location = useLocation();
    const { imeIgrac } = useParams();
    const podatci = location.state?.rowItem || null;
    const imeMomcad = location.state?.imeMomcad || null;
    const [poeni, setPoeni] = useState(0.0);
    return (
        <div className="igrac_page">
            <div className="igrac_container">
                <div className="igrac">
                    <Logo
                        imeMomcad={imeMomcad}
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
                            {imeMomcad} | #{podatci[5]} | {podatci[3]}
                        </h4>
                        <h2 className="igrac_naslov">
                            {imeIgrac.toUpperCase()}
                        </h2>
                    </div>
                </div>
                <div className="visePodataka">
                    <div className="podatak">
                        <h4>DATUM ROĐENJA</h4>
                        <h5>{podatci[8]}</h5>
                    </div>
                    <div className="podatak">
                        <h4>DRŽAVLJANSTVO</h4>
                        <h5>{podatci[2]}</h5>
                    </div>
                    <div className="podatak">
                        <h4>POENI PO UTAKMICAMA</h4>
                        <h5>{poeni.toFixed(1)}</h5>
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
