import * as React from 'react';
import { useState } from 'react';
import './css/home.css';
import { useNavigate } from 'react-router-dom';
function Home() {
    const navigate = useNavigate();
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const components = [
        {
            name: 'Tablica',
            path: '/tablica',
            description: 'Prikaz poretka na tablici te prikaz pojedine momčadi',
            videoSrc: 'tablica.mp4',
        },
        {
            name: 'Trade players',
            path: '/trade',
            description: 'Trade: igrač za igrača',
            videoSrc: 'trade.mp4',
        },
        {
            name: 'Statistika',
            path: '/statistika',
            description:
                'Prikaz statističkih podataka igrača na pojedinoj utakmici',
            videoSrc: 'statistika.mp4',
        },
        {
            name: 'Delegat',
            path: '/Delegat',
            description:
                'Unos statističkih podataka za vođenje evidencije NBA lige',
            videoSrc: 'delegat.mp4',
        },
        {
            name: 'Register',
            path: '/register',
            description: 'Registracija novog korisnika',
        },
    ];

    return (
        <div className="homepage">
            <h1 className="homepage-title">Dobrodošli na početnu stranicu</h1>
            <div className="cards-container">
                {components.map((component, index) => (
                    <div
                        key={index}
                        className={`card ${
                            hoveredIndex !== null && hoveredIndex !== 4
                                ? hoveredIndex === index
                                    ? 'hovered'
                                    : 'hide'
                                : ''
                        }`}
                        onClick={() => navigate(component.path)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <h2>{component.name}</h2>
                        <p>{component.description}</p>
                        <div className="video-container">
                            {hoveredIndex === index && (
                                <video
                                    src={component.videoSrc}
                                    autoPlay
                                    muted
                                    loop
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
