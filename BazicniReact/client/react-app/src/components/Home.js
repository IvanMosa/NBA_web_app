import * as React from 'react';
import { useEffect, useState } from 'react';
import './css/home.css';
import { useNavigate } from 'react-router-dom';
function Home() {
    const navigate = useNavigate();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [clicked, setClicked] = useState(false);

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

    useEffect(() => {
        if (clicked) {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth', // Glatko pomicanje
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth', // Glatko pomicanje
            });
        }
    }, [clicked]);
    return (
        <div className="homepage">
            <h1 className="homepage-title">Dobrodošli na početnu stranicu</h1>
            <div className="cards-container">
                {components.map((component, index) => (
                    <div
                        key={index}
                        className={`card ${
                            clicked && hoveredIndex === index
                                ? 'clicked'
                                : clicked
                                ? 'hide'
                                : !clicked &&
                                  hoveredIndex === index &&
                                  component.name !== 'Register'
                                ? 'hovered'
                                : ''
                        }`}
                        onClick={() => navigate(component.path)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => {
                            if (!clicked) setHoveredIndex(null);
                        }}
                    >
                        <h2>{component.name}</h2>
                        <p>{component.description}</p>
                        <>
                            {!clicked &&
                            hoveredIndex === index &&
                            component.name !== 'Register' ? (
                                <div
                                    className="icon-container"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setClicked(true);
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-down arrow-icon"></i>
                                </div>
                            ) : clicked &&
                              hoveredIndex === index &&
                              component.name !== 'Register' ? (
                                <div
                                    className="icon-container icon-top"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setClicked(false);
                                    }}
                                >
                                    <i className="fa-solid fa-chevron-up arrow-icon"></i>
                                </div>
                            ) : null}
                        </>
                        <div className="video-container">
                            {clicked && hoveredIndex === index && (
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
