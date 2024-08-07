import * as React from 'react';
import { useParams } from 'react-router-dom';
import './css/igrac.css';

function Igrac() {
    const { imeIgrac } = useParams();
    return (
        <div className="igrac_page">
            <div className="igrac_container">
                <h2 className="igrac_naslov">{imeIgrac}</h2>
                <div className="igrac_statistika"></div>
            </div>
        </div>
    );
}

export default Igrac;
