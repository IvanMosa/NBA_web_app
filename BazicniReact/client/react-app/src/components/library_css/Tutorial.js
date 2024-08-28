import * as React from 'react';
import { useState } from 'react';
import './css/tutorial.css';

function Tutorial({ setClickedNavigation }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [clicked, setClicked] = useState(false);

    setClickedNavigation(clicked);
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
            description: 'Unos trade-a igrač za igrača',
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
    ];

    return (
        <div className="detalji">
            <div
                className={
                    clicked ? 'cards-container clicked' : 'cards-container'
                }
            >
                {components.map((component, index) => (
                    <div
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setClicked(!clicked);
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => {
                            if (!clicked) setHoveredIndex(null);
                        }}
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

export default Tutorial;
