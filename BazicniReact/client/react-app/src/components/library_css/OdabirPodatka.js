import React, { useEffect, useState, useRef } from 'react';
import api from '../../api.js';
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
    ulaziIgrac,
    zavrsena,
    errorVrijeme,
    setErrorVrijeme,
    oznacenaUtakmica,
    uzivoUnos,
    setUzivoUnos,
    token,
}) => {
    const [temp_index, setTempIndex] = useState([]);
    const [temp_podatak, setTempPodatak] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [minutes, setMinutes] = useState(12);
    const [seconds, setSeconds] = useState(0);
    const [tenths, setTenths] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [shotClockSeconds, setShotClockSeconds] = useState(24);
    const [shotClockTenths, setShotClockTenths] = useState(0);
    const [isShotClockRunning, setIsShotClockRunning] = useState(false);
    const [cetvrtina, setCetvrtina] = useState(1);
    const [edit, setEdit] = useState(false);
    const [editTekst, setEditTekst] = useState(false);
    const [editShot, setEditShot] = useState(false);
    const [editPoeni, setEditPoeni] = useState(false);
    const [promjenaDomaci, setPromjenaDomaci] = useState(false);
    const [promjenaGosti, setPromjenaGosti] = useState(false);
    const [poeniDomaci, setPoeniDomaci] = useState(
        oznacenaUtakmica.POENI_DOMACI
    );
    const [poeniGosti, setPoeniGosti] = useState(oznacenaUtakmica.POENI_GOSTI);
    const [uzivo, setUzivo] = useState(zavrsena);
    const intervalRef = useRef(null);
    const shotClockRef = useRef(null);

    useEffect(() => {
        setPromjenaDomaci(true);
        setPromjenaGosti(false);
        const timer = setTimeout(() => {
            setPromjenaDomaci(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [oznacenaUtakmica.POENI_DOMACI]);

    useEffect(() => {
        setPromjenaGosti(true);
        setPromjenaDomaci(false);

        const timer = setTimeout(() => {
            setPromjenaGosti(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [oznacenaUtakmica.POENI_GOSTI]);

    const unesiPoene = async () => {
        try {
            const result = await api.post('/unesiPoene', {
                poeniDomaci: poeniDomaci,
                poeniGosti: poeniGosti,
                utakmica_id: oznacenaUtakmica.UTAKMICA_ID,
            });
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (
            poeniDomaci !== oznacenaUtakmica.POENI_DOMACI ||
            poeniGosti !== oznacenaUtakmica.POENI_GOSTI
        ) {
            unesiPoene();
            oznacenaUtakmica.POENI_DOMACI = poeniDomaci;
            oznacenaUtakmica.POENI_GOSTI = poeniGosti;
        }
    }, [poeniDomaci, poeniGosti]);
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                if (tenths > 0) {
                    setTenths(tenths - 1);
                } else {
                    if (seconds > 0) {
                        setSeconds(seconds - 1);
                        setTenths(9);
                    } else {
                        if (minutes > 0) {
                            setMinutes(minutes - 1);
                            setSeconds(59);
                            setTenths(9);
                        } else {
                            if (cetvrtina < 4) {
                                setCetvrtina(cetvrtina + 1);
                            }
                            clearInterval(intervalRef.current);
                            resetShotClock();
                            handleReset();
                        }
                    }
                }
            }, 100);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, minutes, seconds, tenths]);

    useEffect(() => {
        if (isShotClockRunning) {
            if (shotClockSeconds < 6) {
                shotClockRef.current = setInterval(() => {
                    if (shotClockTenths > 0) {
                        setShotClockTenths(shotClockTenths - 1);
                    } else {
                        if (shotClockSeconds > 0) {
                            setShotClockSeconds(shotClockSeconds - 1);
                            setShotClockTenths(9);
                        } else {
                            clearInterval(shotClockRef.current);
                            setIsShotClockRunning(false);
                            setIsRunning(false);
                        }
                    }
                }, 100);
            } else {
                shotClockRef.current = setInterval(() => {
                    if (shotClockSeconds > 0) {
                        setShotClockSeconds(shotClockSeconds - 1);
                    } else {
                        clearInterval(shotClockRef.current);
                        setIsShotClockRunning(false);
                    }
                }, 1000);
            }
        } else {
            clearInterval(shotClockRef.current);
        }
        return () => clearInterval(shotClockRef.current);
    }, [isShotClockRunning, shotClockSeconds, shotClockTenths]);

    useEffect(() => {
        if (errorVrijeme !== '') {
            setErrorMessage(errorVrijeme);
        }
    }, [errorVrijeme]);

    const handleStartStop = () => {
        setIsRunning(!isRunning);
        setIsShotClockRunning(!isShotClockRunning);
    };

    const handleReset = () => {
        setIsRunning(false);
        setIsShotClockRunning(false);
        setMinutes(12);
        setSeconds(0);
        setTenths(0);
        resetShotClock();
    };

    const resetShotClock = () => {
        setShotClockSeconds(24);
    };

    const formatTime = (value) => {
        return value.toString().padStart(2, '0');
    };

    const handlePodatak = (podatak) => {
        if (podatak == temp_podatak) {
            setTempPodatak('');
            setTempIndex([]);
            onSelect('');
        } else {
            setTempPodatak(podatak);
            onSelect(podatak);
        }
    };

    const handleStatus = (status) => {
        if (broj_startera === 10) {
            if (status && temp_podatak && oznacenIgrac.length !== 0) {
                let minute = (cetvrtina - 1) * 12 + minutes;
                let sekunde = seconds;

                onConfirm(status, minute, sekunde, uzivo);
                setTempPodatak('');
            } else if (temp_podatak) {
                setErrorMessage('Igrač mora biti označen!');
            } else if (oznacenIgrac.length !== 0)
                setErrorMessage('Statistički podatak mora biti označen!');
            else
                setErrorMessage(
                    'Igrač i statistički podatak moraju biti označeni!'
                );
        } else {
            if (status && temp_podatak && ulaziIgrac.length !== 0) {
                let minute = (cetvrtina - 1) * 12 + minutes;
                let sekunde = seconds;

                onConfirm(status, minute, sekunde);
                setTempPodatak('');
            } else if (temp_podatak) {
                setErrorMessage('Igrač za ulaz mora biti označen!');
            } else if (ulaziIgrac.length !== 0)
                setErrorMessage('Statistički podatak mora biti označen!');
            else
                setErrorMessage(
                    'Igrač i statistički podatak moraju biti označeni!'
                );
        }
    };

    const handleError = () => {
        setErrorMessage('');
        setErrorVrijeme('');
    };

    const handleToggle = () => {
        setUzivo(!uzivo);
        setUzivoUnos(!uzivoUnos);
        handleReset();
        resetShotClock();
        setCetvrtina(1);
    };
    return (
        <div>
            <div className={`container_button ${errorMessage ? 'blur' : ''}`}>
                {!start && (
                    <div className="match-details">
                        <div className="match_det">
                            <div className="match-detail">
                                <span>{oznacenaUtakmica.DOMACI_NAZIV}</span>
                            </div>
                            {!editPoeni ? (
                                <div
                                    className="match-detail"
                                    onClick={() => {
                                        if (
                                            !isRunning &&
                                            !edit &&
                                            !editShot &&
                                            !editTekst
                                        )
                                            setEditPoeni(true);
                                    }}
                                >
                                    <span
                                        className={
                                            promjenaDomaci ? 'promjena' : ''
                                        }
                                    >
                                        {oznacenaUtakmica.POENI_DOMACI}
                                    </span>
                                    <span>:</span>
                                    <span
                                        className={
                                            promjenaGosti ? 'promjena' : ''
                                        }
                                    >
                                        {oznacenaUtakmica.POENI_GOSTI}
                                    </span>
                                </div>
                            ) : (
                                <div className="match-detail edit">
                                    <div className="editPoeni">
                                        <input
                                            type="number"
                                            value={poeniDomaci}
                                            onChange={(e) =>
                                                setPoeniDomaci(
                                                    Math.max(
                                                        0,
                                                        Math.min(
                                                            300,
                                                            e.target.value
                                                        )
                                                    )
                                                )
                                            }
                                            className="input"
                                        />
                                        <span>:</span>
                                        <input
                                            type="number"
                                            value={poeniGosti}
                                            onChange={(e) =>
                                                setPoeniGosti(
                                                    Math.max(
                                                        0,
                                                        Math.min(
                                                            300,
                                                            e.target.value
                                                        )
                                                    )
                                                )
                                            }
                                            className="input"
                                        />
                                    </div>
                                    <button
                                        className="button"
                                        onClick={() => {
                                            setEditPoeni(false);
                                            unesiPoene();
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            )}

                            <div className="match-detail">
                                <span>{oznacenaUtakmica.GOSTI_NAZIV}</span>
                            </div>
                            <div className="match-detail">
                                <span>{oznacenaUtakmica.DATUM_UTAKMICE}</span>
                            </div>
                        </div>
                        <div className="line"></div>
                    </div>
                )}
                {!start && (
                    <div className="clockContainer">
                        <div className="timeContainer">
                            {!editTekst ? (
                                <div
                                    className="tekst"
                                    onClick={() => {
                                        if (
                                            !isRunning &&
                                            !edit &&
                                            !editShot &&
                                            !editPoeni
                                        )
                                            setEditTekst(true);
                                    }}
                                >
                                    {cetvrtina}/4
                                </div>
                            ) : (
                                <div className="tekst edit">
                                    <div className="editContainer">
                                        <input
                                            type="number"
                                            value={cetvrtina}
                                            onChange={(e) =>
                                                setCetvrtina(
                                                    Math.max(
                                                        1,
                                                        Math.min(
                                                            4,
                                                            e.target.value
                                                        )
                                                    )
                                                )
                                            }
                                            className="input"
                                        />
                                        /4
                                    </div>
                                    <button
                                        className="button"
                                        onClick={() => setEditTekst(false)}
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                            {!edit ? (
                                <div
                                    className="timeDisplay"
                                    onClick={() => {
                                        if (
                                            !isRunning &&
                                            !editTekst &&
                                            !editShot
                                        )
                                            setEdit(true);
                                    }}
                                >
                                    {formatTime(minutes)}:{formatTime(seconds)}.
                                    {tenths}
                                </div>
                            ) : (
                                <div className="timeDisplay edit">
                                    <div className="editContainer">
                                        <input
                                            type="number"
                                            value={minutes}
                                            onChange={(e) => {
                                                setMinutes(
                                                    Math.max(
                                                        0,
                                                        Math.min(
                                                            12,
                                                            e.target.value
                                                        )
                                                    )
                                                );
                                            }}
                                            className="input"
                                        />
                                        :
                                        {minutes < 12 && (
                                            <input
                                                type="number"
                                                value={seconds}
                                                onChange={(e) =>
                                                    setSeconds(
                                                        Math.max(
                                                            0,
                                                            Math.min(
                                                                59,
                                                                e.target.value
                                                            )
                                                        )
                                                    )
                                                }
                                                className="input"
                                            />
                                        )}
                                    </div>
                                    <button
                                        className="button"
                                        onClick={() => setEdit(false)}
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                            {uzivo &&
                                (!editShot ? (
                                    <div
                                        className="shotClockDisplay"
                                        onClick={() => {
                                            if (
                                                !isRunning &&
                                                !editTekst &&
                                                !edit &&
                                                !editPoeni
                                            )
                                                setEditShot(true);
                                        }}
                                    >
                                        :{formatTime(shotClockSeconds)}
                                        {shotClockSeconds < 5 &&
                                            '.' + shotClockTenths}
                                    </div>
                                ) : (
                                    <div className="shotClockDisplay edit">
                                        <div className="shotClockDisplay">
                                            :
                                            <input
                                                type="number"
                                                value={shotClockSeconds}
                                                onChange={(e) =>
                                                    setShotClockSeconds(
                                                        Math.max(
                                                            0,
                                                            Math.min(
                                                                24,
                                                                e.target.value
                                                            )
                                                        )
                                                    )
                                                }
                                                className="input"
                                            />
                                            .
                                            {shotClockSeconds < 5 && (
                                                <input
                                                    type="number"
                                                    value={shotClockTenths}
                                                    onChange={(e) =>
                                                        setShotClockTenths(
                                                            Math.max(
                                                                0,
                                                                Math.min(
                                                                    9,
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        )
                                                    }
                                                    className="input"
                                                />
                                            )}
                                        </div>

                                        <button
                                            className="button"
                                            onClick={() => setEditShot(false)}
                                        >
                                            Save
                                        </button>
                                    </div>
                                ))}
                            <div>
                                <p
                                    className={`switchTekst ${
                                        uzivo ? 'oznacen' : ''
                                    }`}
                                >
                                    Uživo
                                </p>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={uzivo}
                                        onChange={handleToggle}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        <div className="buttonsContainer">
                            {uzivo && (
                                <button
                                    onClick={handleStartStop}
                                    className="button"
                                >
                                    {isRunning ? 'Stop' : 'Start'}
                                </button>
                            )}

                            <button onClick={handleReset} className="button">
                                Reset
                            </button>
                            {uzivo && (
                                <button
                                    onClick={resetShotClock}
                                    className="button"
                                >
                                    Reset Shot Clock
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {!start ? (
                    <>
                        <div className="odabir-button">
                            {statistickiPodatci &&
                                statistickiPodatci.map((podatak, index) =>
                                    broj_startera === 10 && index === 10 ? (
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
                                    ) : broj_startera === 10 ? (
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
                                    ) : (
                                        index === 10 && (
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
                                                {['Ulaz']}
                                            </button>
                                        )
                                    )
                                )}
                        </div>
                        <div className="status_container">
                            {broj_startera === 10 ? (
                                [0, 1, 2].includes(temp_index) ? (
                                    <>
                                        <button
                                            className="status-button"
                                            onClick={() =>
                                                handleStatus(statusi[0])
                                            }
                                        >
                                            {statusi[0]}
                                        </button>
                                        <button
                                            className="status-button"
                                            onClick={() =>
                                                handleStatus(statusi[1])
                                            }
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
                                )
                            ) : (
                                <button
                                    className="status-button"
                                    onClick={() => handleStatus('U tijeku')}
                                >
                                    {['U tijeku']}
                                </button>
                            )}
                        </div>
                    </>
                ) : broj_startera === 10 ? (
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
