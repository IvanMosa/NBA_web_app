import * as React from 'react';
import { useEffect, useState } from 'react';
import './css/home.css';
import axios from 'axios';

function Home() {
    const [utakmica, setUtakmica] = useState([]);
    const [igrac, setIgrac] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const homePoziv = await axios.post(
                    'http://localhost:4000/podatciPocetna'
                );

                setUtakmica(homePoziv.data.utakmica[0]);
                setIgrac(homePoziv.data.igrac[0]);
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);
    return (
        <div className="homepage">
            <div className="homePodatci">
                <div className="homeUtakmica">
                    <div class="homePodatak">
                        <h4>{utakmica.DOMACI_NAZIV}</h4>
                        <h5>
                            {utakmica.POENI_DOMACI} - {utakmica.POENI_GOSTI}
                        </h5>
                        <h4>{utakmica.GOSTI_NAZIV}</h4>
                    </div>
                    <div class="homePodatak1">
                        <h4>Domaci</h4>
                        <h4>Gosti</h4>
                    </div>
                </div>
                <div className="homeIgrac">
                    <p>fff</p>
                </div>
            </div>
            <div className="pozadina">
                <div className="naslov">
                    <h1>Početna stranica</h1>
                </div>
                <img
                    src="homePozadina.webp"
                    alt="Home"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </div>
        </div>
    );
}

export default Home;
