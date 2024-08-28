import React from 'react';
import { useRef, useEffect } from 'react';
import { FastAverageColor } from 'fast-average-color';

const Logo = ({ imeMomcad, visina, style, setDominantColor, none }) => {
    const slikaRef = useRef(null);

    useEffect(() => {
        const fetchDominantColor = async () => {
            if (!imeMomcad) {
                console.error('ImeMomcad is not provided.');
                return;
            }

            try {
                const fac = new FastAverageColor();
                const imageUrl = `/LOGOs/${imeMomcad}.png`;
                if (slikaRef.current) {
                    const color = await fac.getColorAsync(imageUrl);
                    setDominantColor(color.rgba);
                }
            } catch (error) {
                console.error('Error extracting color: ', error);
            }
        };

        fetchDominantColor();
    }, [imeMomcad]);

    if (!imeMomcad) return null;

    return (
        <div>
            <img
                src={`/LOGOs/${imeMomcad}.png`}
                alt={`${imeMomcad} logo`}
                ref={slikaRef}
                style={{
                    marginTop: none ? '3vh' : visina ? '500px' : '20px',
                    marginLeft: none ? '' : style ? '' : '10px',
                    left: style ? style.left : '',
                    top: style ? style.top : '',
                    position: style ? style.position : '',
                    width: 'auto',
                    height: none ? '3vw' : visina ? '150vh' : '4vw',
                    objectFit: visina ? 'cover' : '',
                }}
            />
        </div>
    );
};

export default Logo;
