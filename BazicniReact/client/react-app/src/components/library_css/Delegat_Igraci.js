import React, { useEffect, useState } from 'react';
import './css/delegat_igraci.css';

const DelegatIgraci = ({
    igraci,
    start,
    onSelect,
    onSelectIgrac,
    oznaceniIgrac,
    ulaziIgrac,
    izlaz,
}) => {
    const [starteri, setStarteri] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const handleStarteri = (igrac) => {
        const postoji = starteri.some((item) => item.NAZIV === igrac.NAZIV);
        if (!postoji && starteri.length < 5) {
            igrac.oznacen = true;
            setStarteri([...starteri, igrac]);
            onSelect(igrac, 0);
        } else if (!postoji && starteri.length === 5) {
            setErrorMessage('Možete označiti maksimalno 5 startera!');
        } else {
            const newStarteri = starteri.filter(
                (item) => item.NAZIV !== igrac.NAZIV
            );
            setStarteri(newStarteri);
            igrac.oznacen = false;
            onSelect(igrac, 1);
        }
    };

    const handleAktivni = (igrac) => {
        const postoji = oznaceniIgrac && oznaceniIgrac.NAZIV === igrac.NAZIV;
        console.log(oznaceniIgrac);
        if (!postoji) {
            oznaceniIgrac.oznacen = false;
            igrac.oznacen = true;
            onSelectIgrac(igrac, 0);
        } else {
            igrac.oznacen = false;
            onSelectIgrac([], 0);
        }
    };

    const handleIzlaz = (igrac) => {
        const odobreno =
            oznaceniIgrac.MOMCAD_ID === igrac.MOMCAD_ID &&
            ulaziIgrac.NAZIV === igrac.NAZIV;

        if (!odobreno) {
            ulaziIgrac.oznacen = false;
            igrac.oznacen = true;
            onSelectIgrac(igrac, 1);
        } else {
            igrac.oznacen = false;
            onSelectIgrac([], 1);
        }
    };
    const handleError = () => {
        setErrorMessage('');
    };

    return (
        <div className="del_igr_container">
            <div className="del_igr_buttons">
                {start ? (
                    <>
                        {igraci.map((igrac, index) => (
                            <div
                                className={`del_igr_button_item ${
                                    errorMessage ? 'blur' : ''
                                }`}
                                key={index}
                            >
                                <div
                                    className={`dres_ikona ${
                                        igrac.oznacen ? 'oznacen' : ''
                                    }`}
                                    onClick={() => handleStarteri(igrac)}
                                >
                                    <img
                                        src="/sport-shirt.png"
                                        style={{
                                            width: 'auto',
                                            height: '50px',
                                        }}
                                    />
                                    <span className="broj_dresa">
                                        {igrac.BROJ_DRESA}
                                    </span>
                                </div>
                                <p>{igrac.NAZIV}</p>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {igraci.map((igrac, index) => (
                            <div className="del_igr_button_item" key={index}>
                                <div
                                    className={`dres_ikona ${
                                        igrac.oznacen ? 'oznacen' : ''
                                    }`}
                                    onClick={() => handleAktivni(igrac)}
                                >
                                    <img
                                        src="/sport-shirt.png"
                                        style={{
                                            width: 'auto',
                                            height: '50px',
                                        }}
                                    />
                                    <span className="broj_dresa">
                                        {igrac.BROJ_DRESA}
                                    </span>
                                </div>
                                <p>{igrac.NAZIV}</p>
                            </div>
                        ))}
                    </>
                )}
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
            <div className="del_igr_buttons">
                {izlaz &&
                    oznaceniIgrac.length !== 0 &&
                    izlaz.length > 0 &&
                    izlaz
                        .filter(
                            (item) =>
                                !igraci.some(
                                    (igrac) => igrac.NAZIV === item.NAZIV
                                ) && item.MOMCAD_ID === oznaceniIgrac.MOMCAD_ID
                        )
                        .map((igrac, index) => (
                            <div
                                className={`del_igr_button_item ${
                                    errorMessage ? 'blur' : ''
                                }`}
                                key={index}
                            >
                                <div
                                    className={`dres_ikona ${
                                        igrac.oznacen ? 'oznacen' : ''
                                    }`}
                                    onClick={() => handleIzlaz(igrac)}
                                >
                                    <img
                                        src="/sport-shirt.png"
                                        style={{
                                            width: 'auto',
                                            height: '50px',
                                        }}
                                    />
                                    <span className="broj_dresa">
                                        {igrac.BROJ_DRESA}
                                    </span>
                                </div>
                                <p>{igrac.NAZIV}</p>
                            </div>
                        ))}
            </div>
        </div>
    );
};

export default DelegatIgraci;
