import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/momcad.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { add, format, parse } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import MySelect from './library_css/MySelect.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Logo from './library_css/Logo.js';

const Momcad = () => {
    const { imeMomcad } = useParams();
    const [igraci, setIgraci] = useState([]);
    const [pozicije, setPozicije] = useState([]);
    const [poz, setPoz] = useState(' ');
    const [isEditing, setIsEditing] = useState(false);
    const [promjene, setPromjene] = useState({});
    const [igracInfo, setIgracInfo] = useState({});
    const [options, setOptions] = useState({});
    const [addNew, setAddNew] = useState(false);
    const [noviIgrac, setNoviIgrac] = useState({});
    const [sezone, setSezone] = useState([]);
    const [imeSezone, setimeSezone] = useState('23/24');
    const [utakmice, setUtakmice] = useState([]);

    const [insertMessage, setInsertMessage] = useState('');

    const [onError, setOnError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [ondelete, setDelete] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');
    const [confirmationDialog, setConfirmationDialog] = useState(null);

    const [editingCell, setEditingCell] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchData = async () => {
        const result = await axios.post('http://localhost:4000/showRoster', {
            imeMomcad: imeMomcad,
        });

        setIgraci(Array.isArray(result.data.igraci) ? result.data.igraci : []);

        const pozicijeTemp = Array.isArray(result.data.pozicije)
            ? result.data.pozicije
            : [];

        const drzaveTemp = Array.isArray(result.data.drzave)
            ? result.data.drzave.map((drzava) => ({
                  value: drzava,
                  label: drzava,
              }))
            : [];
        const pozicijeTempAltered = Array.isArray(result.data.pozicije)
            ? result.data.pozicije.map((pozicija) => ({
                  value: pozicija,
                  label: pozicija,
              }))
            : [];
        setPozicije(['Sve pozicije', ...pozicijeTemp]);
        setPoz('Sve pozicije');
        const newOptions = { 2: drzaveTemp, 3: pozicijeTempAltered };
        setOptions(newOptions);

        const result1 = await axios.post(
            'http://localhost:4000/getStatistikaMomcadi',
            { imeMomcad: imeMomcad }
        );
        setUtakmice(result1.data.utakmice);
        setSezone(result1.data.sezone);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // Glatko pomicanje
        });
    }, [location.key]);

    useEffect(() => {
        fetchData();
    }, [imeMomcad]);

    const handleError = () => {
        setErrorMessage(null);
    };

    const handleClick = () => {
        setIsEditing(!isEditing);
    };

    const handleMouseEnter = (rowIndex) => {
        if (!isEditing) {
            setEditingCell(rowIndex);
        }
    };

    const handleMouseClick = (rowIndex) => {
        setEditingCell(rowIndex);
    };
    const isEqual = (rowIndex) => {
        return editingCell == rowIndex;
    };

    const handleInputChange = (selectedOption, rowIndex, rowInd, ime, row) => {
        const newData = { ...promjene };

        const newIgracInfo = { ...igracInfo };
        if (!newIgracInfo[ime]) {
            newIgracInfo[ime] = { rowIndex };
        }

        if (!newData[ime]) newData[ime] = {};
        if (rowInd === 4) {
            newData[ime][rowInd] =
                typeof selectedOption === 'object' && selectedOption !== null
                    ? selectedOption.value.toString()
                    : selectedOption.toString();
        } else {
            newData[ime][rowInd] =
                typeof selectedOption === 'object' && selectedOption !== null
                    ? selectedOption.value.toString()
                    : selectedOption.toString();
        }

        setPromjene(newData);
        setIgracInfo(newIgracInfo);
    };

    //------------------------------------------------------------------------------
    //ADD
    const handleAddClick = () => {
        setAddNew(!addNew);
        const temp = {
            imeIgrac: '',
            visina: '',
            drzava: '',
            pozicija: '',
            datum_od: '',
        };
        setNoviIgrac(temp);
    };

    const handleNoviIgracChange = (value, field) => {
        setNoviIgrac((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    //------------------------------------------------------------------------------

    //------------------------------------------------------------------------------
    //SAVE
    const handleAddSaveClick = async () => {
        try {
            const result = await axios.post('http://localhost:4000/unosIgrac', {
                imeIgrac: noviIgrac.imeIgrac,
                imeMomcad: imeMomcad,
                visina: noviIgrac.visina,
                drzava: noviIgrac.drzava.toString(),
                pozicija: noviIgrac.pozicija.toString(),
                datum_od: noviIgrac.datum_od,
            });
            let temp = result.data.message;
            setInsertMessage(temp);
            console.log(temp);
            if (
                temp ===
                    'Successfuly added a player! Edit team to update info!' ||
                temp ===
                    'Successfuly added a player! Edit team to add more info!'
            ) {
                await new Promise((resolve) => setTimeout(resolve, 3000));

                setIsEditing(false);
                setAddNew(false);
                setInsertMessage('');
                fetchData();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleSaveClick = async () => {
        const promjeneZaAPI = Object.keys(igracInfo).map((ime) => {
            const igracPromjene = promjene[ime] || {};
            if (igracPromjene[4]) {
                const dateStr = igracPromjene[4];
                const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
                igracPromjene[4] = format(parsedDate, 'MM/dd/yyyy');
            }
            return {
                ime: ime,
                promjene: igracPromjene,
            };
        });
        try {
            setIsEditing(false);
            console.log('usaao');
            const result = await axios.post(
                'http://localhost:4000/promjeneMomcad',
                promjeneZaAPI
            );

            console.log(result.data.message);
            if (result.data.message == 'Successfuly updated info!') {
                setAddNew(false);
                setNoviIgrac({});
                setPromjene({});
                setIgracInfo({});
                fetchData();
            }
            setOnError(true);
            setErrorMessage(result.data.message);
        } catch (err) {
            console.log(err);
        }
    };
    //------------------------------------------------------------------------------

    //------------------------------------------------------------------------------
    //DELETE

    const potvrdi = () => {
        return new Promise((resolve) => {
            const handleConfirm = () => resolve(true);
            const handleCancel = () => resolve(false);

            setConfirmationDialog({
                message:
                    'Jeste li sigurni da želite obrisati igrača: ' +
                    igraci[editingCell][0] +
                    '?',
                message1:
                    'Ovom radnjom ćete mu izbrisati sve dosadašnje ugovore, trenutni ugovor te svu statistiku!',
                onConfirm: handleConfirm,
                onCancel: handleCancel,
            });
        });
    };
    const handleDeleteClick = async () => {
        let imeIgrac = igraci[editingCell][0];

        if (!imeIgrac) {
            setOnError(true);
            setErrorMessage('Pogreška pri brisanju! Pokušajte ponovo.');
        }
        setDelete(true);
        let confirm = await potvrdi();
        try {
            setDelete(false);
            if (confirm) {
                const result = await axios.post(
                    'http://localhost:4000/izbrisiIgraca',
                    { imeIgrac: imeIgrac }
                );
                setOnError(true);
                setErrorMessage('Deleting...');
                await new Promise((resolve) => setTimeout(resolve, 3000));

                setErrorMessage(result.data.message);
                setIsEditing();
                fetchData();
            }
        } catch (err) {
            console.log(err);
        }
    };
    //------------------------------------------------------------------------------

    return (
        <div className="momcad_page">
            <div className="logo_back">
                <Logo imeMomcad={imeMomcad} visina={true} />
            </div>
            <div
                className={`momcad_container stil1 ${addNew ? 'blurred' : ''}`}
            >
                <h1 className="momcad_title">{imeMomcad}</h1>
                <hr className="line_momcad" />
                <div className="table_div">
                    <form>
                        <select
                            value={poz}
                            onChange={(e) => setPoz(e.target.value)}
                        >
                            {pozicije.map((pozicija, index) => (
                                <option key={index} value={pozicija}>
                                    {pozicija}
                                </option>
                            ))}
                        </select>
                    </form>
                    {igraci ? (
                        <div className="header_and_button">
                            <table className="data_table">
                                <thead>
                                    <tr>
                                        {[
                                            'NAZIV',
                                            'VISINA',
                                            'DRZAVLJANSTVO',
                                            'POZICIJA',
                                            'DATUM POTPISA',
                                            '',
                                        ].map((header, columnIndex) => (
                                            <th key={columnIndex}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {igraci
                                        .filter((rowItem) => {
                                            if (poz == 'Sve pozicije') {
                                                return true;
                                            }
                                            const lastCell =
                                                rowItem[rowItem.length - 2];
                                            return lastCell == poz;
                                        })
                                        .map((rowItem, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                onMouseEnter={() =>
                                                    handleMouseEnter(rowIndex)
                                                }
                                                onClick={() =>
                                                    handleMouseClick(rowIndex)
                                                }
                                            >
                                                {rowItem
                                                    .slice(0, -6)
                                                    .map((row, rowInd) => (
                                                        <React.Fragment
                                                            key={rowInd}
                                                        >
                                                            <td key={rowInd}>
                                                                {isEditing &&
                                                                isEqual(
                                                                    rowIndex
                                                                ) ? (
                                                                    rowInd ===
                                                                        0 ||
                                                                    rowInd ===
                                                                        1 ? (
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                promjene[
                                                                                    rowItem[0]
                                                                                ]?.[
                                                                                    rowInd
                                                                                ] ||
                                                                                row
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    rowIndex,
                                                                                    rowInd,
                                                                                    rowItem[0],
                                                                                    row
                                                                                )
                                                                            }
                                                                        />
                                                                    ) : rowInd ===
                                                                          2 ||
                                                                      rowInd ===
                                                                          3 ? (
                                                                        <MySelect
                                                                            options={
                                                                                options[
                                                                                    rowInd
                                                                                ] ||
                                                                                []
                                                                            }
                                                                            value={{
                                                                                value:
                                                                                    promjene[
                                                                                        rowItem[0]
                                                                                    ]?.[
                                                                                        rowInd
                                                                                    ] ||
                                                                                    row,
                                                                                label:
                                                                                    promjene[
                                                                                        rowItem[0]
                                                                                    ]?.[
                                                                                        rowInd
                                                                                    ] ||
                                                                                    row,
                                                                            }}
                                                                            onChange={(
                                                                                selectedOption
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    selectedOption,
                                                                                    rowIndex,
                                                                                    rowInd,
                                                                                    rowItem[0],
                                                                                    row
                                                                                )
                                                                            }
                                                                            isSearchable
                                                                        />
                                                                    ) : (
                                                                        <input
                                                                            type="date"
                                                                            value={
                                                                                promjene[
                                                                                    rowItem[0]
                                                                                ]?.[
                                                                                    rowInd
                                                                                ] ||
                                                                                format(
                                                                                    new Date(
                                                                                        row
                                                                                    ),
                                                                                    'yyyy-MM-dd'
                                                                                )
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                handleInputChange(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                    rowIndex,
                                                                                    rowInd,
                                                                                    rowItem[0],
                                                                                    row
                                                                                )
                                                                            }
                                                                        />
                                                                    )
                                                                ) : rowInd ===
                                                                  0 ? (
                                                                    <td className="table_link">
                                                                        <Link
                                                                            to={`/Igrac/${row}`}
                                                                            state={{
                                                                                rowItem,
                                                                                imeMomcad:
                                                                                    imeMomcad,
                                                                            }}
                                                                        >
                                                                            {
                                                                                row
                                                                            }
                                                                        </Link>
                                                                    </td>
                                                                ) : (
                                                                    promjene[
                                                                        rowItem[0]
                                                                    ]?.[
                                                                        rowInd
                                                                    ] || row
                                                                )}
                                                            </td>
                                                        </React.Fragment>
                                                    ))}
                                                <td className="button_cell">
                                                    <div className="button_divs">
                                                        {isEqual(rowIndex) &&
                                                            isEditing && (
                                                                <div className="button_div">
                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            handleSaveClick
                                                                        }
                                                                    >
                                                                        <i
                                                                            className={`fas fa-save`}
                                                                        ></i>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        {isEqual(rowIndex) &&
                                                            isEditing && (
                                                                <div className="button_div">
                                                                    <button
                                                                        type="button"
                                                                        onClick={
                                                                            handleDeleteClick
                                                                        }
                                                                    >
                                                                        <i class="fa-solid fa-delete-left"></i>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        {isEqual(rowIndex) && (
                                                            <div className="button_div">
                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        handleClick
                                                                    }
                                                                >
                                                                    <i
                                                                        className={`fas fa-edit`}
                                                                    ></i>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                            <div className="button_divs_add">
                                <div className="button_div">
                                    <button
                                        type="button"
                                        onClick={handleAddClick}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No data available</p>
                    )}
                </div>

                <div className="back_div">
                    <button onClick={() => navigate(-1)}>
                        <i className="fa-solid fa-circle-arrow-left"></i>
                    </button>
                </div>
            </div>
            {addNew && (
                <div className="overlay" onClick={handleAddClick}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="naslovUnos">
                            Unesi podatke o novom igraču
                        </h2>
                        <input
                            type="text"
                            value={noviIgrac.imeIgrac}
                            onChange={(e) =>
                                handleNoviIgracChange(
                                    e.target.value,
                                    'imeIgrac'
                                )
                            }
                            placeholder="Ime igrača*"
                            className="inputField" // Dodajte klasu za inpute
                        />
                        <input
                            type="text"
                            value={noviIgrac.visina}
                            onChange={(e) =>
                                handleNoviIgracChange(e.target.value, 'visina')
                            }
                            placeholder="Visina"
                            className="inputField" // Dodajte klasu za inpute
                        />
                        <MySelect
                            className="selectField" // Dodajte klasu za select
                            options={options[2] || []}
                            value={{
                                value: noviIgrac.drzava,
                                label: noviIgrac.drzava,
                            }}
                            onChange={(selectedOption) =>
                                handleNoviIgracChange(
                                    selectedOption.value,
                                    'drzava'
                                )
                            }
                            isSearchable
                            placeholder="Država"
                        />
                        <MySelect
                            className="selectField" // Dodajte klasu za select
                            options={options[3] || []}
                            value={{
                                value: noviIgrac.pozicija,
                                label: noviIgrac.pozicija,
                            }}
                            onChange={(selectedOption) =>
                                handleNoviIgracChange(
                                    selectedOption.value,
                                    'pozicija'
                                )
                            }
                            isSearchable
                        />
                        <input
                            type="date"
                            value={noviIgrac.datum}
                            onChange={(e) =>
                                handleNoviIgracChange(
                                    e.target.value,
                                    'datum_od'
                                )
                            }
                            className="inputField" // Dodajte klasu za inpute
                        />
                        <div className="buttonContainer">
                            {insertMessage && (
                                <p className="errorMessage">{insertMessage}</p>
                            )}
                            <button
                                type="button"
                                onClick={handleAddSaveClick}
                                className="saveButton"
                            >
                                <i className="fas fa-save"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {errorMessage && (
                <div className="errorOverlay">
                    <div className="errorModal">
                        <p className="errorMessage">{errorMessage}</p>
                        {errorMessage !== 'Deleting...' && (
                            <button
                                type="button"
                                className="okButton"
                                onClick={handleError}
                            >
                                OK
                            </button>
                        )}
                    </div>
                </div>
            )}

            {ondelete && (
                <div className="errorOverlay">
                    <div className="errorModal">
                        <p className="errorMessage">
                            {confirmationDialog.message1}
                        </p>
                        <p className="errorMessage">
                            {confirmationDialog.message}
                        </p>
                        <button
                            type="button"
                            className="okButton"
                            onClick={confirmationDialog.onConfirm}
                        >
                            Da
                        </button>
                        <button
                            type="button"
                            className="okButton"
                            onClick={confirmationDialog.onCancel}
                        >
                            Odustani
                        </button>
                    </div>
                </div>
            )}

            <div className="statistika_momcad">
                <div
                    className="statistika_container"
                    style={{ backgroundColor: '#f9f9f9' }}
                >
                    <p className="statistika_naslov">Statistika momčadi</p>
                    <div className="statistika_menu">
                        <div className="statistika_form">
                            <form>
                                <p className="sezona_text">Sezona</p>
                                <select
                                    value={imeSezone}
                                    onChange={(e) =>
                                        setimeSezone(e.target.value)
                                    }
                                >
                                    {sezone.map((sezona, index) => (
                                        <option key={index} value={sezona}>
                                            {sezona}
                                        </option>
                                    ))}
                                </select>
                            </form>
                        </div>
                        <div className="momcadStat">
                            <table className="data-table2">
                                <thead>
                                    <tr>
                                        {[
                                            'DOMACI',
                                            'REZULTAT',
                                            'GOSTI',
                                            'SUDAC',
                                            'SEZONA',
                                            'DATUM',
                                            'W/L',
                                        ].map((column, columnIndex) => (
                                            <th key={columnIndex}>{column}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {utakmice
                                        .filter((rowItem) => {
                                            return rowItem.SEZONA == imeSezone;
                                        })
                                        .map((rowItem, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {Object.values(rowItem)
                                                    .slice(0, -5)
                                                    .map((row, rowInd) => (
                                                        <React.Fragment
                                                            key={rowInd}
                                                        >
                                                            {rowInd === 0 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={`/Momcad/${rowItem.DOMACI_NAZIV}`}
                                                                    >
                                                                        {
                                                                            rowItem.DOMACI
                                                                        }
                                                                    </Link>
                                                                </td>
                                                            ) : rowInd === 1 ? (
                                                                <td
                                                                    key={rowInd}
                                                                >
                                                                    {rowItem.POENI_DOMACI +
                                                                        ' : ' +
                                                                        rowItem.POENI_GOSTI}
                                                                </td>
                                                            ) : rowInd === 2 ? (
                                                                <td className="table_link">
                                                                    <Link
                                                                        to={`/Momcad/${rowItem.GOSTI_NAZIV}`}
                                                                    >
                                                                        {
                                                                            rowItem.GOSTI
                                                                        }
                                                                    </Link>
                                                                </td>
                                                            ) : (
                                                                <td
                                                                    key={rowInd}
                                                                >
                                                                    {row}
                                                                </td>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Momcad;
