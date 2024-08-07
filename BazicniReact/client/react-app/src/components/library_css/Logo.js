import React from 'react';

const logos = {
    'Atlanta Hawks': '/LOGOs/Atlanta Hawks.png',
    'Boston Celtics': '/LOGOs/Boston Celtics.png',
    'Brooklyn Nets': '/LOGOs/Brooklyn Nets.png',
    // Dodajte sve potrebne klubove
};

const Logo = ({ imeMomcad }) => {
    const logoSrc = logos[imeMomcad];

    if (imeMomcad)
        return (
            <div>
                <img
                    src={logoSrc}
                    alt={`${imeMomcad} logo`}
                    style={{
                        marginTop: '20px',
                        width: 'auto',
                        height: '150px',
                    }}
                />
            </div>
        );
    else return null;
};

export default Logo;
