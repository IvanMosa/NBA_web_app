import React from 'react';

const Logo = ({ imeMomcad, visina }) => {
    if (imeMomcad)
        return (
            <div>
                <img
                    src={`/LOGOs/${imeMomcad}.png`}
                    alt={`${imeMomcad} logo`}
                    style={{
                        marginTop: visina ? '500px' : '20px',
                        marginLeft: '10px',
                        width: 'auto',
                        height: visina ? '150vh' : '4vw',
                        objectFit: visina ? 'cover' : '',
                    }}
                />
            </div>
        );
    else return null;
};

export default Logo;
