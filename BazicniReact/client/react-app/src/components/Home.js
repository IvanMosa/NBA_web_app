import * as React from 'react';
import { useEffect, useState } from 'react';
import './css/home.css';
import axios from 'axios';
import Logo from './library_css/Logo';
import { Link } from 'react-router-dom';

function Home({ roles = [] }) {
    const [utakmica, setUtakmica] = useState([]);
    const [prvihDesetUtakmica, setPrvihDesetUtakmica] = useState([]);
    const [igrac, setIgrac] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const homePoziv = await axios.post(
                    'http://localhost:4000/podatciPocetna',
                    {},
                    {
                        headers: {
                            authorization: `Bearer ${token}`,
                        },
                    }
                );

                setUtakmica(homePoziv.data.utakmica[0]);
                setIgrac(homePoziv.data.igrac[0]);
                setPrvihDesetUtakmica(homePoziv.data.prvihDesetUtakmica);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);
    if (roles.includes('PREGLED') || roles == 'ADMIN')
        return (
            <div className="homepage">
                <div className="pozadina">
                    <h1>Početna stranica</h1>
                    <div className="homeSlika">
                        <img
                            src="homePozadina.webp"
                            alt="Home"
                            style={{
                                zIndex: '1',
                                position: 'relative',
                                display: 'block',
                                width: '100%',
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                </div>
                <div className="homeContainer">
                    <div className="homePodatci">
                        <div className="homeUtakmicaPoveznica">
                            <div className="homeUtakmica">
                                <div className="posljednjaUtakmica">
                                    <h2>POSLJEDNJA UTAKMICA</h2>
                                    <div class="homePodatak zadnja">
                                        <h4>
                                            <Link
                                                to={`/Momcad/${utakmica.DOMACI_NAZIV}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'rgb(179, 179, 179)',
                                                }}
                                            >
                                                <Logo
                                                    imeMomcad={
                                                        utakmica.DOMACI_NAZIV
                                                    }
                                                    none={true}
                                                    home={true}
                                                />
                                                {utakmica.DOMACI_NAZIV}
                                            </Link>
                                        </h4>
                                        <h4>
                                            <h3>{utakmica.VRIJEME}</h3>
                                            <h5>{utakmica.DATUM}</h5>
                                            <h6>
                                                {utakmica.POENI_DOMACI} -{' '}
                                                {utakmica.POENI_GOSTI}
                                            </h6>
                                        </h4>
                                        <h4>
                                            <Link
                                                to={`/Momcad/${utakmica.GOSTI_NAZIV}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'rgb(179, 179, 179)',
                                                }}
                                            >
                                                <Logo
                                                    imeMomcad={
                                                        utakmica.GOSTI_NAZIV
                                                    }
                                                    none={true}
                                                    home={true}
                                                />
                                                {utakmica.GOSTI_NAZIV}
                                            </Link>
                                        </h4>
                                    </div>
                                </div>
                            </div>
                            <Link
                                to={'/Statistika'}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="homePoveznica">
                                    <h2>
                                        Pritisnite za pregled potpune statistika
                                    </h2>
                                </div>
                            </Link>
                        </div>
                        <div className="homeIgrac">
                            <h2>NAJVIŠE POENA PO UTAKMICI</h2>
                            <div className="homeIgracPodatci">
                                <div className="homeIgracGornji">
                                    <div className="slikaIgrac">
                                        <img
                                            src={`/Slike igraca/${igrac.IGRAC}.webp`}
                                            alt={`${igrac.IGRAC} picture`}
                                            className="slikaNajboljiIgrac"
                                        />
                                    </div>
                                    <div className="homeIgracDetalji">
                                        <Link
                                            to={`/Igrac/${igrac.IGRAC}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <h4>{igrac.IGRAC}</h4>
                                        </Link>
                                        <h5>Broj dresa: #{igrac.BROJ_DRESA}</h5>
                                        <h5>Godine: {igrac.GODINE} </h5>
                                    </div>
                                </div>
                                <div className="homeIgracDonji">
                                    <div className="lijeviPodatak">
                                        <Link
                                            to={`/Momcad/${igrac.IGRACMOMCAD}`}
                                            style={{
                                                textDecoration: 'none',
                                                color: 'gray',
                                            }}
                                        >
                                            <Logo
                                                imeMomcad={igrac.IGRACMOMCAD}
                                                none={true}
                                                home={true}
                                            />
                                            <h4>{igrac.IGRACMOMCAD}</h4>
                                        </Link>
                                    </div>
                                    <div className="desniPodatak">
                                        <h3>POENA PO UTAKMICI</h3>
                                        <h4>
                                            {igrac.POENI &&
                                                igrac.POENI.toFixed(1)}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="homeSidePodatci">
                        <div style={{ paddingLeft: '1vw' }}>
                            <h2>REZULTATI POSLJEDNIH 10 UTAKMICA</h2>
                        </div>
                        <div
                            style={{
                                paddingLeft: '2vw',
                                paddingRight: '2vw',
                                paddingTop: '1vw',
                            }}
                        >
                            {prvihDesetUtakmica.map((utk, index) => {
                                return (
                                    <div className="homePodatak" key={utk.id}>
                                        <h4>
                                            <Link
                                                to={`/Momcad/${utk.DOMACI_NAZIV}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'gray',
                                                }}
                                            >
                                                <Logo
                                                    imeMomcad={utk.DOMACI_NAZIV}
                                                    none={true}
                                                    home={true}
                                                />
                                                {utk.DOMACI_NAZIV}
                                            </Link>
                                        </h4>
                                        <h4>
                                            <h3>{utk.VRIJEME}</h3>
                                            <h5>{utk.DATUM}</h5>
                                            <h6>
                                                {utk.POENI_DOMACI} -{' '}
                                                {utk.POENI_GOSTI}
                                            </h6>
                                        </h4>
                                        <h4>
                                            <Link
                                                to={`/Momcad/${utk.GOSTI_NAZIV}`}
                                                style={{
                                                    textDecoration: 'none',
                                                    color: 'gray',
                                                }}
                                            >
                                                <Logo
                                                    imeMomcad={utk.GOSTI_NAZIV}
                                                    none={true}
                                                    home={true}
                                                />
                                                {utk.GOSTI_NAZIV}
                                            </Link>
                                        </h4>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
}

export default Home;
