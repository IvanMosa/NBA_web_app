import React, { useEffect, useState } from 'react';
import './css/odabirpodataka.css';

const OdabirPodatka = ({ statistickiPodatci, statusi }) => {
    const [temp_index, setTempIndex] = useState([]);

    console.log(statistickiPodatci, statusi);
    return (
        <div className="container_button">
            <div className="odabir-button">
                {statistickiPodatci.map((podatak, index) => (
                    <button
                        key={index}
                        className="button"
                        onClick={() => setTempIndex(index)}
                    >
                        {podatak}
                    </button>
                ))}
            </div>
            {[0, 1, 2].includes(temp_index) ? (
                <div className="status_container">
                    <button className="status-button">{statusi[0]}</button>
                    <button className="status-button">{statusi[1]}</button>
                </div>
            ) : (
                <div className="status_container">
                    <button className="status-button">{statusi[3]}</button>
                </div>
            )}
        </div>
    );
};

export default OdabirPodatka;
