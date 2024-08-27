import React, { useState } from 'react';
import './css/karijeramomcadi.css';
import Logo from './Logo';

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

    const handlePrevious = () => {
        if (currentIndex < sveSezone.length - 1 && !isAnimating) {
            setDirection('down');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => prevIndex + 1);
                setIsAnimating(false);
            }, 500); // Vrijeme animacije
        }
    };

    const handleNext = () => {
        if (currentIndex > 0 && !isAnimating) {
            setDirection('up');
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentIndex((prevIndex) => prevIndex - 1);
                setIsAnimating(false);
            }, 500); // Vrijeme animacije
        }
    };

    const currentSeasonData = sveSezone[currentIndex];
    const statsForSeason = statistikaSezona.find(
        (stat) =>
            stat.SEZONA === currentSeasonData.season &&
            stat.IGRACMOMCADKRATICA === currentSeasonData.kratica
    );

    return (
        <div className="karijeraMomcadi">
            <div className="info-box">
                <div className="navigation">
                    <div
                        onClick={handleNext}
                        className={`icon-button ${
                            currentIndex === 0 ? 'disabled' : ''
                        }`}
                    >
                        <i className="fa-solid fa-chevron-up"></i>
                    </div>
                    {statsForSeason ? (
                        <div
                            className={`data-container ${direction} ${
                                isAnimating ? 'animating' : ''
                            }`}
                        >
                            <Logo imeMomcad={statsForSeason.IGRACMOMCAD} />
                            <p>
                                {`Season: ${
                                    currentSeasonData.sezonaPrikaz
                                } - Average Minutes: ${(
                                    statsForSeason.MINUTE /
                                    statsForSeason.BROJUTAKMICA /
                                    60
                                ).toFixed(2)}`}
                            </p>
                        </div>
                    ) : (
                        <p>No data available for this season</p>
                    )}
                    <div
                        onClick={handlePrevious}
                        className={`icon-button ${
                            currentIndex === sveSezone.length - 1
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
