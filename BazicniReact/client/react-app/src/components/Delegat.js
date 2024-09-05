import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import './css/delegat.css';
import { format, parse } from 'date-fns';
import axios from 'axios';
import DropdownMenu from './library_css/DropdownMenu';
import Logo from './library_css/Logo';
import OdabirPodatka from './library_css/OdabirPodatka';
import DelegatIgraci from './library_css/Delegat_Igraci';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Delegat = ({ token }) => {
    const [momcadi, setMomcadi] = useState([]);
    const [sudci, setSudci] = useState([]);
    const [lige, setLige] = useState([]);
    const [utakmica, setUtakmica] = useState(false);
    const [blurano, setBlurano] = useState(false);
    const [blurano_pocetna, setBluranoPocetna] = useState(true);
    const [datum, setDatum] = useState('');
    const [vrijeme, setVrijeme] = useState('');
    const [domaci, setDomaci] = useState('');
    const [gosti, setGosti] = useState('');
    const [sudac, setSudac] = useState('');
    const [sezona, setSezona] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [oznacena, setOznacena] = useState(false);
    const [nova, setNova] = useState(false);
    const [statistika, setStatistika] = useState([]);
    const [utakmica_id, setUtakmica_ID] = useState(0);
    const [sveUtakmice, setSveUtakmice] = useState([]);
    const [oznacenaUtakmica, setOznacenaUtakmica] = useState([]);
    const [hover, setHover] = useState(false);
    const [statusi, setStatusi] = useState([]);
    const [statistickiPodatci, setStatistickiPodatci] = useState([]);
    const [igraci_domaci, setIgraciDomaci] = useState([]);
    const [igraci_gosti, setIgraciGosti] = useState([]);
    const [aktivni_domaci, setAktivniDomaci] = useState([]);
    const [aktivni_gosti, setAktivniGosti] = useState([]);
    const [starteri_spremljeni, setStarteriSpremljeni] = useState(false);
    const [potvrdaPromjene, setPotvrdaPromjene] = useState(false);
    const [zavrsena, setZavrsena] = useState(false);
    const [pozivStarteriOznaceni, setPozivStarteriOznaceni] = useState(false);

    const [Igrac_promjena, setIgracPromjena] = useState([]);
    const [Igrac_ulazi, setIgracUlazi] = useState([]);
    const [oznaceni_podatak, setOznaceniPodatak] = useState('');
    const [status, setStatus] = useState('');
    const [minute, setMinute] = useState(0);
    const [sekunde, setSekunde] = useState(0);
    const [errorVrijeme, setErrorVrijeme] = useState('');
    const [promjene, setPromjene] = useState(false);
    const [promjeneUlazIzlaz, setPromjeneUlazIzlaz] = useState(false);
    const [highlight, setHighlight] = useState(false);
    const [highlight2, setHighlight2] = useState(false);
    const [pokreni, setPokreni] = useState(false);
    const [uzivoUnos, setUzivoUnos] = useState(false);

    const [editingCell, setEditingCell] = useState(0);
    const [onUtakmicaDelete, setUtakmicaDelete] = useState(false);
    const [ondelete, setDelete] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState(null);

    const fetchData = async () => {
        try {
            const pocetniPodatci = await axios.post(
                'http://localhost:4000/getMomcadi',
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            setMomcadi(
                Array.isArray(pocetniPodatci.data.momcad)
                    ? pocetniPodatci.data.momcad
                    : []
            );
            setSudci(
                Array.isArray(pocetniPodatci.data.sudci)
                    ? pocetniPodatci.data.sudci
                    : []
            );
            setLige(
                Array.isArray(pocetniPodatci.data.sezona)
                    ? pocetniPodatci.data.sezona
                    : []
            );

            const statistikaMomcadi = await axios.post(
                'http://localhost:4000/getStatistikaMomcadi',
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            setSveUtakmice(statistikaMomcadi.data.utakmice);

            const statPodatci_statusi = await axios.post(
                'http://localhost:4000/getStatistickiPodatci',
                {},
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );

            setStatistickiPodatci(
                Array.isArray(statPodatci_statusi.data.statistickiPodatci)
                    ? statPodatci_statusi.data.statistickiPodatci
                    : []
            );
            setStatusi(
                Array.isArray(statPodatci_statusi.data.statusi)
                    ? statPodatci_statusi.data.statusi
                    : []
            );
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const clickOdaberi = () => {
        setUtakmica(!utakmica);
        setBlurano(!blurano);
        setHover(false);
    };
    const clickUtakmica = () => {
        setUtakmica(!utakmica);
        setBlurano(!blurano);
        setNova(!nova);
        setHover(false);
    };

    const handleGosti = (gosti) => {
        setGosti(gosti);
    };

    const handleDomaci = (domaci) => {
        setDomaci(domaci);
    };

    const handleSudac = (sudac) => {
        setSudac(sudac);
    };

    const handleLiga = (Liga) => {
        setSezona(Liga);
    };

    const handleSave = async () => {
        if (domaci && gosti && sudac && sezona && vrijeme && datum) {
            try {
                setErrorMessage('');
                const result = await axios.post(
                    'http://localhost:4000/kreirajUtakmicu',
                    {
                        domaci: domaci.toString(),
                        gosti: gosti.toString(),
                        datum: datum + ' ' + vrijeme,
                        sezona: sezona.toString(),
                        sudac: sudac.toString(),
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (
                    result.data.message === 'Insert was completed successfully!'
                ) {
                    const result1 = await axios.post(
                        'http://localhost:4000/getStatistikaMomcadi',
                        {
                            imeMomcad: domaci.toString(),
                            imeMomcad1: gosti.toString(),
                            datum: datum + ' ' + vrijeme,
                        },
                        {
                            headers: {
                                authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setOznacenaUtakmica(result1.data.utakmica);
                    setErrorMessage('Uspješno krenirana utakmica!');
                    await new Promise((resolve) => setTimeout(resolve, 3000));
                    setUtakmica_ID(result.data.utakmica_id);

                    const parsedDate = parse(datum, 'yyyy-MM-dd', new Date());
                    let temp_datum = format(parsedDate, 'MM/dd/yyyy');
                    const novaUtakmica = {
                        DOMACI_NAZIV: domaci.toString(),
                        GOSTI_NAZIV: gosti.toString(),
                        DATUM_UTAKMICE: temp_datum,
                        SUDAC: sudac.toString(),
                        POENI_DOMACI: 0,
                        POENI_GOSTI: 0,
                    };

                    setSveUtakmice([novaUtakmica, ...sveUtakmice]);
                    setUtakmica(false);
                    setNova(false);
                    setBlurano(false);
                    setOznacena(true);
                    setErrorMessage('');
                    setBluranoPocetna(false);
                    setZavrsena(false);
                } else setErrorMessage(result.data.message);
            } catch (err) {
                console.log(err);
            }
        } else setErrorMessage('Sva polja moraju biti označena!');
    };

    const handleOdabir = (rowItem) => {
        setOznacenaUtakmica(rowItem);
        setUtakmica_ID(rowItem.UTAKMICA_ID);
    };

    const handleAktivniDomaci = (igrac, status) => {
        if (status === 0) setAktivniDomaci([...aktivni_domaci, igrac]);
        else {
            const newStarteri = aktivni_domaci.filter(
                (item) => item.NAZIV !== igrac.NAZIV
            );
            setAktivniDomaci(newStarteri);
        }
    };

    const handleAktivniGosti = (igrac, status) => {
        if (status === 0) setAktivniGosti([...aktivni_gosti, igrac]);
        else {
            const newStarteri = aktivni_gosti.filter(
                (item) => item.NAZIV !== igrac.NAZIV
            );
            setAktivniGosti(newStarteri);
        }
    };

    const handleStarteriSave = async () => {
        const domaci_temp = aktivni_domaci.map((igrac) => ({
            ...igrac,
            oznacen: false,
        }));
        setAktivniDomaci(domaci_temp);

        const gosti_temp = aktivni_gosti.map((igrac) => ({
            ...igrac,
            oznacen: false,
        }));
        setAktivniGosti(gosti_temp);

        try {
            const result = await axios.post(
                'http://localhost:4000/unesiStatistiku',
                {
                    utakmica_id: utakmica_id,
                    aktivni_domaci: domaci_temp,
                    aktivni_gosti: gosti_temp,
                    status: 'U tijeku',
                    podatak: 'Ulaz/Izlaz',
                    setStarteri: true,
                },
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    },
                }
            );
            setPozivStarteriOznaceni(true);
        } catch (err) {
            console.log(err);
        }
    };

    const prikaziStatistiku = async () => {
        try {
            const [statistikaResponse, igraciResponses] = await Promise.all([
                axios.post(
                    'http://localhost:4000/prikaziStatistikuUtakmice',
                    {
                        utakmica_id: utakmica_id,
                        domaci_naziv: oznacenaUtakmica.DOMACI_NAZIV.toString(),
                        gosti_naziv: oznacenaUtakmica.GOSTI_NAZIV.toString(),
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                ),
                Promise.all([
                    axios.post(
                        'http://localhost:4000/showRoster',
                        {
                            imeMomcad: oznacenaUtakmica.DOMACI_NAZIV.toString(),
                            status: 0,
                        },
                        {
                            headers: {
                                authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                    axios.post(
                        'http://localhost:4000/showRoster',
                        {
                            imeMomcad: oznacenaUtakmica.GOSTI_NAZIV.toString(),
                            status: 0,
                        },
                        {
                            headers: {
                                authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                ]),
            ]);

            const domaci_temp = igraciResponses[0].data.igraci.map((igrac) => ({
                ...igrac,
                oznacen: false,
            }));
            setIgraciDomaci(domaci_temp);
            const gosti_temp = igraciResponses[1].data.igraci.map((igrac) => ({
                ...igrac,
                oznacen: false,
            }));
            setIgraciGosti(gosti_temp);
            if (statistikaResponse.data.statistika.length !== 0) {
                const aktivni_domaci_temp =
                    statistikaResponse.data.aktivni_domaci.map((igrac) => ({
                        ...igrac,
                        oznacen: false,
                    }));
                const aktivni_gosti_temp =
                    statistikaResponse.data.aktivni_gosti.map((igrac) => ({
                        ...igrac,
                        oznacen: false,
                    }));
                if (
                    aktivni_domaci_temp.length !== 0 &&
                    aktivni_gosti_temp.length !== 0
                ) {
                    await Promise.all(
                        [setAktivniDomaci(aktivni_domaci_temp)],
                        [setAktivniGosti(aktivni_gosti_temp)]
                    );

                    setIgraciDomaci(domaci_temp);
                    setIgraciGosti(gosti_temp);
                    setZavrsena(false);
                } else if (aktivni_domaci_temp.length !== 0) {
                    setAktivniDomaci(aktivni_domaci_temp);
                    setAktivniGosti([]);
                    setZavrsena(true);
                } else if (aktivni_gosti_temp.length !== 0) {
                    setAktivniDomaci([]);
                    setAktivniGosti(aktivni_gosti_temp);
                    setZavrsena(true);
                }
                setStarteriSpremljeni(true);
            }

            setStatistika(statistikaResponse.data.statistika);
            setOznacena(true);
            setUtakmica(false);
            setBlurano(false);
            setBluranoPocetna(false);
        } catch (err) {
            console.log('Error during fetch:', err);
        }
    };

    useEffect(() => {
        if (utakmica_id !== 0) {
            prikaziStatistiku();
        }
    }, [utakmica_id]);

    useEffect(() => {
        if (pozivStarteriOznaceni === true) {
            prikaziStatistiku();
            setStarteriSpremljeni(true);
            setPozivStarteriOznaceni(false);
        }
    }, [pozivStarteriOznaceni]);

    const handleOznacenIgrac = (oznacenIgrac, status) => {
        if (oznacenIgrac.length === 0 && status === 0) {
            setIgracPromjena([]);
        } else if (oznacenIgrac.length !== 0 && status === 0) {
            setIgracPromjena(oznacenIgrac);
        } else if (oznacenIgrac.length !== 0 && status === 1) {
            setIgracUlazi(oznacenIgrac);
        } else if (oznacenIgrac.length === 0 && status === 1) {
            Igrac_ulazi.oznacen = false;
            setIgracUlazi([]);
        }
    };

    const handleOznaceniPodatak = (podatak) => {
        setOznaceniPodatak(podatak.toString());
    };

    const handleConfirm = (status, minute, sekunde) => {
        setPokreni(true);
        setStatus(status.toString());
        setMinute(minute);
        setSekunde(sekunde);
    };

    useEffect(() => {
        const unesiPromjene = async () => {
            try {
                let result;
                if (oznaceni_podatak == 'Ulaz/Izlaz') {
                    if (
                        Igrac_promjena.length !== 0 &&
                        Igrac_ulazi.length !== 0
                    ) {
                        result = await axios.post(
                            'http://localhost:4000/unesiStatistiku',
                            {
                                igrac_id: Igrac_promjena,
                                igrac_ulaz_id: Igrac_ulazi,
                                domaci_naziv:
                                    oznacenaUtakmica.DOMACI_NAZIV.toString(),
                                gosti_naziv:
                                    oznacenaUtakmica.GOSTI_NAZIV.toString(),
                                status: status,
                                minute: minute,
                                sekunde: sekunde,
                                podatak: oznaceni_podatak,
                                utakmica_id: utakmica_id,
                            },
                            {
                                headers: {
                                    authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (result.data.message) {
                            setErrorVrijeme(result.data.message);
                        } else {
                            setPotvrdaPromjene(true);
                            await new Promise((resolve) =>
                                setTimeout(resolve, 750)
                            );
                            setPotvrdaPromjene(false);
                            setStatistika((prev) => [
                                result.data.noviUlaz,
                                result.data.noviIzlaz,
                                ...prev,
                            ]);
                            setAktivniDomaci(
                                result.data.aktivni_domaci
                                    ? result.data.aktivni_domaci
                                    : []
                            );
                            setAktivniGosti(
                                result.data.aktivni_gosti
                                    ? result.data.aktivni_gosti
                                    : []
                            );
                            setPromjeneUlazIzlaz(true);
                            setPromjene(true);
                        }
                    } else {
                        result = await axios.post(
                            'http://localhost:4000/unesiStatistiku',
                            {
                                igrac_ulaz_id: Igrac_ulazi,
                                domaci_naziv:
                                    oznacenaUtakmica.DOMACI_NAZIV.toString(),
                                gosti_naziv:
                                    oznacenaUtakmica.GOSTI_NAZIV.toString(),
                                status: status,
                                minute: minute,
                                sekunde: sekunde,
                                podatak: oznaceni_podatak,
                                utakmica_id: utakmica_id,
                            },
                            {
                                headers: {
                                    authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        if (result.data.message) {
                            setErrorVrijeme(result.data.message);
                        } else {
                            setPotvrdaPromjene(true);
                            await new Promise((resolve) =>
                                setTimeout(resolve, 750)
                            );
                            setPotvrdaPromjene(false);
                            setStatistika((prev) => [
                                result.data.noviPodatak,
                                ...prev,
                            ]);
                            setAktivniDomaci(
                                result.data.aktivni_domaci
                                    ? result.data.aktivni_domaci
                                    : []
                            );
                            setAktivniGosti(
                                result.data.aktivni_gosti
                                    ? result.data.aktivni_gosti
                                    : []
                            );
                            setPromjene(true);
                        }
                    }
                } else {
                    result = await axios.post(
                        'http://localhost:4000/unesiStatistiku',
                        {
                            igrac_id: Igrac_promjena,
                            status: status.toString(),
                            minute: minute,
                            sekunde: sekunde,
                            podatak: oznaceni_podatak,
                            utakmica_id: utakmica_id,
                            uzivo: uzivoUnos,
                        },
                        {
                            headers: {
                                authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setStatistika((prev) => [result.data.noviPodatak, ...prev]);
                    setPromjene(true);
                    const momcad = result.data.momcad;
                    const poeni = result.data.poeni;

                    if (momcad == 'DOMACI') {
                        oznacenaUtakmica.POENI_DOMACI += poeni;
                    } else if (momcad == 'GOSTI') {
                        oznacenaUtakmica.POENI_GOSTI += poeni;
                    }
                }

                Igrac_promjena.oznacen = false;
                Igrac_ulazi.oznacen = false;
                setIgracPromjena([]);
                setIgracUlazi([]);
                setStatus('');
                setMinute(0);
                setSekunde(0);
                setOznaceniPodatak('');
                setPokreni(false);
            } catch (err) {
                console.log(err);
            }
        };
        if (pokreni === true) {
            unesiPromjene();
        }
    }, [pokreni]);

    useEffect(() => {
        if (promjene) {
            if (promjeneUlazIzlaz) {
                setHighlight2(true);
            }
            setHighlight(true);
            const timer = setTimeout(() => {
                setHighlight(false);
                setHighlight2(false);
                setPromjene(false);
                setPromjeneUlazIzlaz(false);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [promjene]);

    const handleMouseEnter = (rowIndex) => {
        setEditingCell(rowIndex);
    };

    const handleMouseClick = (rowIndex) => {
        setEditingCell(rowIndex);
    };

    const potvrdi = (izbrisiPodatak, izbrisiPodatakUlaz, utakmica) => {
        return new Promise((resolve) => {
            const handleConfirm = () => resolve(true);
            const handleCancel = () => resolve(false);

            if (utakmica) {
                setConfirmationDialog({
                    message:
                        'Ako izbrišete utakmicu između ' +
                        utakmica.DOMACI_NAZIV +
                        ' i ' +
                        utakmica.GOSTI_NAZIV +
                        ' izbrisat će se i svi statistički podatci s te utakmice!\n\nJeste li sigurni u ovu radnju?',
                    onConfirm: handleConfirm,
                    onCancel: handleCancel,
                });
            } else if (
                izbrisiPodatak[1] == 'Izlaz' &&
                izbrisiPodatakUlaz[1] == 'Ulaz'
            ) {
                setConfirmationDialog({
                    message:
                        'Ako izbrišete izlaz igrača\n' +
                        izbrisiPodatak[0] +
                        '\nizbrisati će se i ulaz igrača\n' +
                        izbrisiPodatakUlaz[0],
                    onConfirm: handleConfirm,
                    onCancel: handleCancel,
                });
            } else if (izbrisiPodatakUlaz && izbrisiPodatakUlaz[1] != 'Ulaz') {
                setConfirmationDialog({
                    message: 'Pogreška kod brisanja podatka!',
                    onCancel: handleCancel,
                });
            } else {
                setConfirmationDialog({
                    message:
                        'Jeste li sigurni da želite obrisati podatak: "' +
                        izbrisiPodatak[1] +
                        '" za igrača: "' +
                        izbrisiPodatak[0] +
                        '" ?',
                    onConfirm: handleConfirm,
                    onCancel: handleCancel,
                });
            }
        });
    };

    const handleDeleteClick = async (rowIndex) => {
        const izbrisiPodatak = statistika[rowIndex];

        setDelete(true);
        let confirm;
        let izbrisiPodatakUlaz;

        if (izbrisiPodatak[1] == 'Izlaz') {
            izbrisiPodatakUlaz = statistika[rowIndex - 1];
            confirm = await potvrdi(izbrisiPodatak, izbrisiPodatakUlaz);
        } else {
            confirm = await potvrdi(izbrisiPodatak);
        }
        try {
            setDelete(false);
            if (confirm) {
                let novaStatistika;

                if (izbrisiPodatak[1] == 'Izlaz') {
                    novaStatistika = [
                        ...statistika.slice(0, rowIndex - 1),
                        ...statistika.slice(rowIndex + 1),
                    ];

                    let stariIgrac = igraci_domaci.find(
                        (item) => item.NAZIV == izbrisiPodatak[0]
                    )
                        ? igraci_domaci.find(
                              (item) => item.NAZIV == izbrisiPodatak[0]
                          )
                        : igraci_gosti.find(
                              (item) => item.NAZIV == izbrisiPodatak[0]
                          );

                    let noviIgrac = igraci_domaci.find(
                        (item) => item.NAZIV == izbrisiPodatakUlaz[0]
                    )
                        ? igraci_domaci.find(
                              (item) => item.NAZIV == izbrisiPodatakUlaz[0]
                          )
                        : igraci_gosti.find(
                              (item) => item.NAZIV == izbrisiPodatakUlaz[0]
                          );

                    let momcad_id = stariIgrac.MOMCAD_ID;

                    if (igraci_domaci[0].MOMCAD_ID === momcad_id) {
                        const index = aktivni_domaci.findIndex(
                            (igrac) => igrac.NAZIV === noviIgrac.NAZIV
                        );

                        const noviDomaci = [
                            ...aktivni_domaci.slice(0, index),
                            ...aktivni_domaci.slice(index + 1),
                            stariIgrac,
                        ];
                        setAktivniDomaci(noviDomaci);
                    } else if (igraci_gosti[0].MOMCAD_ID === momcad_id) {
                        const index = aktivni_gosti.findIndex(
                            (igrac) => igrac.NAZIV === noviIgrac.NAZIV
                        );

                        const noviGosti = [
                            ...aktivni_gosti.slice(0, index),
                            ...aktivni_gosti.slice(index + 1),
                            stariIgrac,
                        ];
                        setAktivniGosti(noviGosti);
                    }
                } else {
                    novaStatistika = [
                        ...statistika.slice(0, rowIndex),
                        ...statistika.slice(rowIndex + 1),
                    ];
                }
                setStatistika(novaStatistika);

                if (novaStatistika.length === 0) {
                    setStarteriSpremljeni(false);
                    setAktivniDomaci([]);
                    setAktivniGosti([]);
                }

                const result = await axios.post(
                    'http://localhost:4000/izbrisiPodatak',
                    {
                        izbrisiPodatak: izbrisiPodatak,
                        izbrisiPodatakUlaz: izbrisiPodatakUlaz,
                        utakmica_id: utakmica_id,
                        uzivo: uzivoUnos,
                    },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );

                prikaziStatistiku();
                const momcad = result.data.momcad;
                const poeni = result.data.poeni;

                if (
                    momcad == 'DOMACI' &&
                    oznacenaUtakmica.POENI_DOMACI >= poeni
                ) {
                    oznacenaUtakmica.POENI_DOMACI -= poeni;
                } else if (
                    momcad == 'GOSTI' &&
                    oznacenaUtakmica.POENI_GOSTI >= poeni
                ) {
                    oznacenaUtakmica.POENI_GOSTI -= poeni;
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleDeleteUtakmica = async (utakmica) => {
        setUtakmicaDelete(true);
        let confirm = await potvrdi(null, null, utakmica);
        try {
            setUtakmicaDelete(false);
            if (confirm) {
                const izbrisi = await axios.post(
                    'http://localhost:4000/izbrisiUtakmicu',
                    { utakmica_id: utakmica.UTAKMICA_ID },
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (izbrisi.data.message == 'Uspješno izbrisana utakmica!') {
                    setSveUtakmice((prev) =>
                        prev.filter(
                            (pojedinaUtakmica) =>
                                pojedinaUtakmica.UTAKMICA_ID !==
                                utakmica.UTAKMICA_ID
                        )
                    );
                    setErrorMessage(izbrisi.data.message);
                    setTimeout(() => {
                        setErrorMessage('');
                    }, 5000);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };
    return (
        <div>
            <div className={`container ${blurano ? 'blurred' : ''}`}>
                <div className={blurano_pocetna ? 'side blurred' : 'side'}>
                    {!blurano_pocetna && (
                        <>
                            <div className="p_logo">
                                <Logo
                                    imeMomcad={oznacenaUtakmica.DOMACI_NAZIV}
                                />
                                <p>{oznacenaUtakmica.DOMACI_NAZIV}</p>
                            </div>
                            {!starteri_spremljeni ? (
                                <DelegatIgraci
                                    igraci={igraci_domaci}
                                    start={true}
                                    onSelect={handleAktivniDomaci}
                                />
                            ) : (
                                <DelegatIgraci
                                    igraci={aktivni_domaci}
                                    start={false}
                                    onSelectIgrac={handleOznacenIgrac}
                                    oznaceniIgrac={Igrac_promjena}
                                    izlaz={
                                        oznaceni_podatak == 'Ulaz/Izlaz' ||
                                        aktivni_domaci.length < 5
                                            ? igraci_domaci
                                            : []
                                    }
                                    ulaziIgrac={Igrac_ulazi}
                                    setIgraci={setAktivniDomaci}
                                    setIzlaz={setIgraciDomaci}
                                    potvrdaPromjene={potvrdaPromjene}
                                    setPotvrdaPromjene={setPotvrdaPromjene}
                                    aktivniProtivnik={aktivni_gosti.length}
                                    momcadID={igraci_domaci[0].MOMCAD_ID}
                                />
                            )}
                        </>
                    )}
                </div>
                {oznacenaUtakmica.length === 0 ? (
                    <div className="odabirPocetak_container">
                        <div className="odabirPocetak" onClick={clickUtakmica}>
                            <p>Unesi novu utakmicu</p>
                        </div>
                        <div className="odabirPocetak" onClick={clickOdaberi}>
                            <p>Odaberi završenu utakmicu</p>
                        </div>
                    </div>
                ) : (
                    <div className="middle-container">
                        <div className="above-container">
                            <div
                                className="above-middle"
                                onClick={() => {
                                    setOznacenaUtakmica([]);
                                    setUtakmica_ID(0);
                                    setOznacena(false);
                                    setBluranoPocetna(true);
                                    setAktivniDomaci([]);
                                    setAktivniGosti([]);
                                    setStarteriSpremljeni(false);
                                    setPozivStarteriOznaceni(false);
                                    setStatistika([]);
                                }}
                            >
                                <p>Klikni za promjenu utakmice</p>
                            </div>
                        </div>
                        <div
                            className={`middle ${
                                blurano_pocetna ? 'blurred' : ''
                            }`}
                        >
                            {!blurano_pocetna && (
                                <OdabirPodatka
                                    statistickiPodatci={statistickiPodatci}
                                    statusi={statusi}
                                    start={starteri_spremljeni ? false : true}
                                    broj_startera={
                                        aktivni_domaci.length +
                                        aktivni_gosti.length
                                    }
                                    onSave={handleStarteriSave}
                                    onSelect={handleOznaceniPodatak}
                                    onConfirm={handleConfirm}
                                    oznacenIgrac={Igrac_promjena}
                                    ulaziIgrac={Igrac_ulazi}
                                    zavrsena={zavrsena}
                                    errorVrijeme={errorVrijeme}
                                    setErrorVrijeme={setErrorVrijeme}
                                    oznacenaUtakmica={oznacenaUtakmica}
                                    uzivoUnos={uzivoUnos}
                                    setUzivoUnos={setUzivoUnos}
                                    token={token}
                                />
                            )}
                        </div>
                    </div>
                )}
                <div className={blurano_pocetna ? 'side blurred' : 'side'}>
                    {!blurano_pocetna && (
                        <>
                            <div className="p_logo">
                                <Logo
                                    imeMomcad={oznacenaUtakmica.GOSTI_NAZIV}
                                />
                                <p>{oznacenaUtakmica.GOSTI_NAZIV}</p>
                            </div>
                            {!starteri_spremljeni ? (
                                <DelegatIgraci
                                    igraci={igraci_gosti}
                                    start={true}
                                    onSelect={handleAktivniGosti}
                                />
                            ) : (
                                <DelegatIgraci
                                    igraci={aktivni_gosti}
                                    start={false}
                                    onSelectIgrac={handleOznacenIgrac}
                                    oznaceniIgrac={Igrac_promjena}
                                    izlaz={
                                        oznaceni_podatak == 'Ulaz/Izlaz' ||
                                        aktivni_gosti.length < 5
                                            ? igraci_gosti
                                            : []
                                    }
                                    ulaziIgrac={Igrac_ulazi}
                                    setIgraci={setAktivniGosti}
                                    setIzlaz={setIgraciGosti}
                                    potvrdaPromjene={potvrdaPromjene}
                                    setPotvrdaPromjene={setPotvrdaPromjene}
                                    aktivniProtivnik={aktivni_domaci.length}
                                    momcadID={igraci_gosti[0].MOMCAD_ID}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>
            {utakmica ? (
                nova ? (
                    <div className="overlay" onClick={clickUtakmica}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-content">
                                <div className="dropdown_container">
                                    <DropdownMenu
                                        items={lige}
                                        odabir="Odaberi ligu"
                                        onSelect={handleLiga}
                                    />
                                    <DropdownMenu
                                        items={momcadi}
                                        odabir="Odaberi domaćina"
                                        onSelect={handleDomaci}
                                    />
                                    <DropdownMenu
                                        items={momcadi}
                                        odabir="Odaberi goste"
                                        onSelect={handleGosti}
                                    />
                                    <DropdownMenu
                                        items={sudci}
                                        odabir="Odaberi sudca"
                                        onSelect={handleSudac}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">
                                        Odaberi datum:
                                    </label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={datum}
                                        onChange={(e) =>
                                            setDatum(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">
                                        Odaberi vrijeme:
                                    </label>
                                    <input
                                        type="time"
                                        className="input-field"
                                        value={vrijeme}
                                        onChange={(e) =>
                                            setVrijeme(e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    className="modal_button"
                                    onClick={handleSave}
                                >
                                    Spremi
                                </button>
                                {errorMessage && (
                                    <p className="dropdown_container_p">
                                        {errorMessage}
                                    </p>
                                )}
                            </div>

                            <div className="back_div">
                                <button onClick={clickUtakmica}>
                                    <i className="fa-solid fa-circle-arrow-left"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overlay" onClick={clickOdaberi}>
                        <div
                            className="modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {[
                                                'DOMACI',
                                                'REZULTAT',
                                                'GOSTI',
                                                'SUDAC',
                                                'DATUM',
                                                ' ',
                                            ].map((column, columnIndex) => (
                                                <th key={columnIndex}>
                                                    {column}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sveUtakmice.map(
                                            (rowItem, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    onMouseEnter={() =>
                                                        setEditingCell(rowIndex)
                                                    }
                                                >
                                                    <td
                                                        onClick={() =>
                                                            handleOdabir(
                                                                rowItem
                                                            )
                                                        }
                                                    >
                                                        {rowItem.DOMACI_NAZIV}
                                                    </td>
                                                    <td
                                                        onClick={() =>
                                                            handleOdabir(
                                                                rowItem
                                                            )
                                                        }
                                                    >
                                                        {rowItem.POENI_DOMACI +
                                                            ':' +
                                                            rowItem.POENI_GOSTI}
                                                    </td>
                                                    <td
                                                        onClick={() =>
                                                            handleOdabir(
                                                                rowItem
                                                            )
                                                        }
                                                    >
                                                        {rowItem.GOSTI_NAZIV}
                                                    </td>
                                                    <td
                                                        onClick={() =>
                                                            handleOdabir(
                                                                rowItem
                                                            )
                                                        }
                                                    >
                                                        {rowItem.SUDAC}
                                                    </td>
                                                    <td
                                                        onClick={() =>
                                                            handleOdabir(
                                                                rowItem
                                                            )
                                                        }
                                                    >
                                                        {rowItem.DATUM_UTAKMICE}
                                                    </td>
                                                    <td
                                                        onClick={() =>
                                                            handleDeleteUtakmica(
                                                                rowItem
                                                            )
                                                        }
                                                        style={{
                                                            width: '5vw',
                                                            padding: '0',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        {editingCell ===
                                                            rowIndex && (
                                                            <i class="fa-solid fa-delete-left"></i>
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                                {onUtakmicaDelete && (
                                    <div className="errorOverlay">
                                        <div className="errorModal">
                                            <p className="errorMessage">
                                                {confirmationDialog.message}
                                            </p>
                                            <button
                                                type="button"
                                                className="okButton"
                                                onClick={
                                                    confirmationDialog.onConfirm
                                                }
                                            >
                                                Da
                                            </button>
                                            <button
                                                type="button"
                                                className="okButton"
                                                onClick={
                                                    confirmationDialog.onCancel
                                                }
                                            >
                                                Odustani
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="back_div">
                                <button onClick={clickOdaberi}>
                                    <i className="fa-solid fa-circle-arrow-left"></i>
                                </button>
                            </div>
                            <div
                                className={
                                    errorMessage
                                        ? 'utakmicaError message'
                                        : 'utakmicaError'
                                }
                            >
                                {errorMessage && (
                                    <p className="dropdown_container_p">
                                        {errorMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )
            ) : null}
            {oznacena ? (
                <div className="statistics">
                    {statistika && statistika.length !== 0 ? (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        {[
                                            'NAZIV',
                                            'PODATAK',
                                            'VRIJEME NA SEMAFORU',
                                            'STATUS',
                                            '',
                                        ].map((column, columnIndex) => (
                                            <th key={columnIndex}>{column}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {statistika.map((rowItem, rowIndex) => (
                                        <tr
                                            key={rowIndex}
                                            className={
                                                rowIndex === 0 && highlight
                                                    ? 'highlight'
                                                    : rowIndex === 1 &&
                                                      highlight2
                                                    ? 'highlight2'
                                                    : ''
                                            }
                                            onMouseEnter={() =>
                                                handleMouseEnter(rowIndex)
                                            }
                                            onClick={() =>
                                                handleMouseClick(rowIndex)
                                            }
                                        >
                                            {rowItem
                                                .slice(0, -2)
                                                .map((row, rowInd) => (
                                                    <td key={rowInd}>{row}</td>
                                                ))}
                                            <td className="button_cell statistika">
                                                {rowIndex === editingCell && (
                                                    <div className="button_div statistika">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteClick(
                                                                    rowIndex
                                                                )
                                                            }
                                                        >
                                                            <i class="fa-solid fa-delete-left"></i>
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {ondelete && (
                                <div className="errorOverlay">
                                    <div className="errorModal">
                                        <p className="errorMessage">
                                            {confirmationDialog.message}
                                        </p>
                                        <button
                                            type="button"
                                            className="okButton"
                                            onClick={
                                                confirmationDialog.onConfirm
                                            }
                                        >
                                            Da
                                        </button>
                                        <button
                                            type="button"
                                            className="okButton"
                                            onClick={
                                                confirmationDialog.onCancel
                                            }
                                        >
                                            Odustani
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>
                            Unesite statističke podatke kako biste ih ovdje
                            vidjeli!
                        </p>
                    )}
                </div>
            ) : null}
        </div>
    );
};

export default Delegat;
