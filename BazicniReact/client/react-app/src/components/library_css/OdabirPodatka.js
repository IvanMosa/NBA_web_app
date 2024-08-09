import React, { useEffect, useState } from 'react';
import './css/odabirpodataka.css';

const OdabirPodatka = ({
    statistickiPodatci,
    statusi,
    start,
    broj_startera,
    onSave,
    onSelect,
    onConfirm,
    oznacenIgrac,
}) => {
    const [temp_index, setTempIndex] = useState([]);
    const [temp_podatak, setTempPodatak] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handlePodatak = (podatak) => {
        setTempPodatak(podatak);
        onSelect(podatak);
    };

    const handleStatus = (status) => {
        if (status && temp_podatak && oznacenIgrac.length !== 0) {
            onConfirm(status);
            setTempPodatak('');
        } else if (temp_podatak) {
            setErrorMessage('Igrač mora biti označen!');
        } else if (oznacenIgrac.length !== 0)
            setErrorMessage('Statistički podatak mora biti označen!');
        else
            setErrorMessage(
                'Igrač i statistički podatak moraju biti označeni!'
            );
    };

    const handleError = () => {
        setErrorMessage('');
    };

    return (
        <div>
            <div className={`container_button ${errorMessage ? 'blur' : ''}`}>
                {!start ? (
                    <>
                        <div className="odabir-button">
                            {statistickiPodatci &&
                                statistickiPodatci.map((podatak, index) =>
                                    index === 10 ? (
                                        <>
                                            <button
                                                key={index}
                                                className={`button ${
                                                    temp_podatak === podatak
                                                        ? 'oznacen'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    setTempIndex(index);
                                                    handlePodatak(podatak);
                                                }}
                                            >
                                                {['Izlaz']}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            key={index}
                                            className={`button ${
                                                temp_podatak === podatak
                                                    ? 'oznacen'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                setTempIndex(index);
                                                handlePodatak(podatak);
                                            }}
                                        >
                                            {podatak}
                                        </button>
                                    )
                                )}
                        </div>
                        <div className="status_container">
                            {[0, 1, 2].includes(temp_index) ? (
                                <>
                                    <button
                                        className="status-button"
                                        onClick={() => handleStatus(statusi[0])}
                                    >
                                        {statusi[0]}
                                    </button>
                                    <button
                                        className="status-button"
                                        onClick={() => handleStatus(statusi[1])}
                                    >
                                        {statusi[1]}
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="status-button"
                                    onClick={() => handleStatus(statusi[3])}
                                >
                                    {statusi[3]}
                                </button>
                            )}
                        </div>
                    </>
                ) : broj_startera === 10 ? ( // Corrected conditional check for broj_startera
                    <div className="status_container">
                        <button className="status-button" onClick={onSave}>
                            {['Spremi']}
                        </button>
                    </div>
                ) : (
                    <p>Označite 5 startera za domaće i goste</p>
                )}
            </div>
            {errorMessage && (
                <div
                    className="error_del_Overlay"
                    onClick={() => handleError()}
                >
                    <div className="error_del_Modal">
                        <p className="error_del_Message">{errorMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OdabirPodatka;
