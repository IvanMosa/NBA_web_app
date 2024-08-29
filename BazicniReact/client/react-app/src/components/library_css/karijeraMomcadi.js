import React, { useState } from 'react';
import './css/karijeramomcadi.css';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const KarijeraMomcadi = ({ ugovoriIgrac, statistikaSezona }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    const sveSezone = [];

    ugovoriIgrac.forEach((ugovor) => {
        const startYear = parseInt(ugovor.DATUM_OD);
        const endYear =
            ugovor.DATUM_DO === null
                ? new Date().getFullYear()
                : parseInt(ugovor.DATUM_DO) + 2000;

        for (let year = startYear; year <= endYear; year++) {
            const season = `${String(year).slice(-2)}/${String(year + 1).slice(
                -2
            )}`;
            sveSezone.push({
                season,
                igracmomcad: ugovor.NAZIV,
                kratica: ugovor.KRATICA,
                sezonaPrikaz: `${String(year).slice(-2)}-${String(
                    year + 1
                ).slice(-2)}`,
            });
        }
    });

    const handleNext = () => {
        if (currentIndex < sveSezone.length - 1 && !isAnimating) {
            setDirection('down');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => prevIndex + 1);
                setIsAnimating(false);
            }, 700);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0 && !isAnimating) {
            setDirection('up');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => prevIndex - 1);
                setIsAnimating(false);
            }, 700);
        }
    };

    console.log(statistikaSezona);
    const statsForSeason = statistikaSezona;
    console.log(statsForSeason);
    console.log(currentIndex);
    return (
        <div className="karijeraMomcadi">
            <div className="info-box">
                <div className="navigation">
                    <div
                        onClick={handlePrevious}
                        className={`icon-button ${
                            currentIndex === 0 ? 'disabled' : ''
                        }`}
                    >
                        <i className="fa-solid fa-chevron-up"></i>
                    </div>
                    {statsForSeason[currentIndex] && (
                        <div
                            className={`data-container ${direction} ${
                                isAnimating ? 'animating' : ''
                            }`}
                        >
                            <div className="karijeraPodatak">
                                <Logo
                                    imeMomcad={
                                        statsForSeason[currentIndex].IGRACMOMCAD
                                    }
                                    none={true}
                                />
                                <h4 className="table_link">
                                    <Link
                                        to={`/Momcad/${statsForSeason[currentIndex].IGRACMOMCAD}`}
                                    >
                                        {
                                            statsForSeason[currentIndex]
                                                .IGRACMOMCAD
                                        }
                                    </Link>
                                </h4>
                            </div>
                            <div className="karijeraPodatak">
                                <div className="karijeraMaliPodatak">
                                    <h4>SEZONA</h4>
                                    <h5>
                                        {statsForSeason[currentIndex].SEZONA}
                                    </h5>
                                </div>
                                <div className="karijeraMaliPodatak">
                                    <h4>BROJ UTAKMICA</h4>
                                    <h5>
                                        {
                                            statsForSeason[currentIndex]
                                                .BROJUTAKMICA
                                        }
                                    </h5>
                                </div>
                            </div>
                            <div className="karijeraPodatak">
                                <div className="karijeraMaliPodatak">
                                    <h4>PLASMAN MOMČADI</h4>
                                    <h5>
                                        {statsForSeason[currentIndex].PLASMAN}
                                    </h5>
                                </div>
                                <div className="karijeraMaliPodatak">
                                    <h4>MINUTE</h4>
                                    <h5>
                                        {(
                                            statsForSeason[currentIndex]
                                                .MINUTE /
                                            statsForSeason[currentIndex]
                                                .BROJUTAKMICA /
                                            60
                                        ).toFixed(1)}
                                    </h5>
                                </div>
                            </div>
                        </div>
                    )}
                    <div
                        onClick={handleNext}
                        className={`icon-button ${
                            currentIndex === statistikaSezona.length - 1
                                ? 'disabled'
                                : ''
                        }`}
                    >
                        <i className="fa-solid fa-chevron-down"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KarijeraMomcadi;
