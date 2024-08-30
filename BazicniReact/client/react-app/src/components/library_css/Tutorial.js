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
            description: 'Prikaz poretka na tablici te prikaz pojedine momčadi',
            videoSrc: '/tablica.mp4',
        },
        {
            name: 'Trade players',
            description: 'Unos trade-a igrač za igrača',
            videoSrc: '/trade.mp4',
        },
        {
            name: 'Statistika',
            description:
                'Prikaz statističkih podataka igrača na pojedinoj utakmici',
            videoSrc: '/statistika.mp4',
        },
        {
            name: 'Delegat',
            description:
                'Unos statističkih podataka za vođenje evidencije NBA lige',
            videoSrc: '/delegat.mp4',
        },
        {
            name: 'Igraci',
            description:
                'Pronađite igrača koji vas zanima i saznajte sve podatke o njemu',
            videoSrc: '/igraci.mp4',
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
