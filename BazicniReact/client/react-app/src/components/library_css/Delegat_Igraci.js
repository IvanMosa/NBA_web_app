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
    potvrdaPromjene,
    aktivniProtivnik,
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

    useEffect(() => {
        if (igraci.length === 0) {
            setStarteri(true);
        }
    }, [igraci]);
    const handleAktivni = (igrac) => {
        const postoji = oznaceniIgrac && oznaceniIgrac.NAZIV === igrac.NAZIV;

        if (igraci.length === 5 && aktivniProtivnik === 5) {
            if (!postoji) {
                oznaceniIgrac.oznacen = false;
                igrac.oznacen = true;
                onSelectIgrac(igrac, 0);

                onSelectIgrac([], 1);
            } else if (postoji && (!izlaz || izlaz.length === 0)) {
                igrac.oznacen = false;
                onSelectIgrac([], 0);
                onSelectIgrac([], 1);
            } else if (postoji && izlaz && izlaz.length > 0) {
                igrac.oznacen = false;
                onSelectIgrac([], 0);
                onSelectIgrac([], 1);
            }
        } else if (aktivniProtivnik < 5) {
            setErrorMessage('U igri mora biti 10 igrača!');
        }
    };

    const handleIzlaz = (igrac) => {
        if (oznaceniIgrac.length > 0) {
            const nijeOdobreno =
                oznaceniIgrac.MOMCAD_ID === igrac.MOMCAD_ID &&
                ulaziIgrac.NAZIV === igrac.NAZIV;

            if (!nijeOdobreno) {
                ulaziIgrac.oznacen = false;
                igrac.oznacen = true;
                onSelectIgrac(igrac, 1);
            } else {
                igrac.oznacen = false;
                onSelectIgrac([], 1);
            }
        } else {
            const nijeOdobreno =
                igraci[0].MOMCAD_ID === igrac.MOMCAD_ID &&
                ulaziIgrac.NAZIV === igrac.NAZIV;

            if (!nijeOdobreno) {
                ulaziIgrac.oznacen = false;
                igrac.oznacen = true;
                onSelectIgrac(igrac, 1);
            } else {
                igrac.oznacen = false;
                onSelectIgrac([], 1);
            }
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
                                        alt="sport shirt"
                                        style={{
                                            width: 'auto',
                                            height: '6vh',
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
                        {izlaz &&
                        izlaz.length > 0 &&
                        oznaceniIgrac &&
                        igraci.find((item) => item === oznaceniIgrac) ? (
                            <div
                                className={`del_igr_button_item ${
                                    potvrdaPromjene ? 'animate11' : 'animate1'
                                }`}
                                key={oznaceniIgrac.NAZIV}
                            >
                                <div
                                    className={`dres_ikona ${
                                        oznaceniIgrac.oznacen ? 'oznacen' : ''
                                    }`}
                                    onClick={() => handleAktivni(oznaceniIgrac)}
                                >
                                    <img
                                        src="/sport-shirt.png"
                                        alt="sport shirt"
                                        style={{
                                            width: 'auto',
                                            height: '5vh',
                                        }}
                                    />
                                    <span className="broj_dresa">
                                        {oznaceniIgrac.BROJ_DRESA}
                                    </span>
                                </div>
                                <p>{oznaceniIgrac.NAZIV}</p>
                                <img
                                    src="/red-arrow-down.png"
                                    alt="red arrow"
                                    style={{
                                        width: 'auto',
                                        height: '50px',
                                    }}
                                />
                            </div>
                        ) : (
                            igraci.map((igrac, index) => (
                                <div
                                    className="del_igr_button_item"
                                    key={index}
                                >
                                    <div
                                        className={`dres_ikona ${
                                            igrac.oznacen ? 'oznacen' : ''
                                        }`}
                                        onClick={() => handleAktivni(igrac)}
                                    >
                                        <img
                                            src="/sport-shirt.png"
                                            alt="sport shirt"
                                            style={{
                                                width: 'auto',
                                                height: '5vh',
                                            }}
                                        />
                                        <span className="broj_dresa">
                                            {igrac.BROJ_DRESA}
                                        </span>
                                    </div>
                                    <p>{igrac.NAZIV}</p>
                                </div>
                            ))
                        )}

                        <div className="line"></div>
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
                {ulaziIgrac && izlaz.find((item) => item === ulaziIgrac) ? (
                    <div
                        className={`del_igr_button_item ${
                            potvrdaPromjene && oznaceniIgrac.length !== 0
                                ? 'animate22'
                                : potvrdaPromjene
                                ? 'animate222'
                                : 'animate2'
                        }`}
                        key={ulaziIgrac.NAZIV}
                    >
                        <img
                            src="/green-arrow-up.png"
                            alt="green arrow"
                            style={{
                                width: 'auto',
                                height: '55px',
                                marginTop: '50px',
                            }}
                        />
                        <div
                            className={`dres_ikona ${
                                ulaziIgrac.oznacen ? 'oznacen' : ''
                            }`}
                            onClick={() => handleIzlaz(ulaziIgrac)}
                        >
                            <img
                                src="/sport-shirt.png"
                                alt="sport shirt"
                                style={{
                                    width: 'auto',
                                    height: '5vh',
                                }}
                            />
                            <span className="broj_dresa">
                                {ulaziIgrac.BROJ_DRESA}
                            </span>
                        </div>
                        <p>{ulaziIgrac.NAZIV}</p>
                    </div>
                ) : izlaz && oznaceniIgrac.length !== 0 && izlaz.length > 0 ? (
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
                                        alt="sport shirt"
                                        style={{
                                            width: 'auto',
                                            height: '5vh',
                                        }}
                                    />
                                    <span className="broj_dresa">
                                        {igrac.BROJ_DRESA}
                                    </span>
                                </div>
                                <p>{igrac.NAZIV}</p>
                            </div>
                        ))
                ) : izlaz && igraci.length < 5 && izlaz.length > 0 ? (
                    izlaz
                        .filter(
                            (item) =>
                                !igraci.some(
                                    (igrac) => igrac.NAZIV === item.NAZIV
                                ) && item.MOMCAD_ID === igraci[0].MOMCAD_ID
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
                                        alt="sport shirt"
                                        style={{
                                            width: 'auto',
                                            height: '5vh',
                                        }}
                                    />
                                    <span className="broj_dresa">
                                        {igrac.BROJ_DRESA}
                                    </span>
                                </div>
                                <p>{igrac.NAZIV}</p>
                            </div>
                        ))
                ) : null}
            </div>
        </div>
    );
};

export default DelegatIgraci;
