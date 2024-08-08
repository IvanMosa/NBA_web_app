import React from 'react';

const logos = {
    'Atlanta Hawks': '/LOGOs/Atlanta Hawks.png',
    'Boston Celtics': '/LOGOs/Boston Celtics.png',
    'Brooklyn Nets': '/LOGOs/Brooklyn Nets.png',
    'Charlotte Hornets': '/LOGOs/Charlotte Hornets.png',
    'Chicago Bulls': '/LOGOs/Chicago Bulls.png',
    'Cleveland Cavaliers': '/LOGOs/Cleveland Cavaliers.png',
    'Dallas Mavericks': '/LOGOs/Dallas Mavericks.png',
    'Denver Nuggets': '/LOGOs/Denver Nuggets.png',
    'Detroit Pistons': '/LOGOs/Detroit Pistons.png',
    'Golden State Warriors': '/LOGOs/Golden State Warriors.png',
    'Houston Rockets': '/LOGOs/Houston Rockets.png',
    'Indiana Pacers': '/LOGOs/Indiana Pacers.png',
    'LA Clippers': '/LOGOs/LA Clippers.png',
    'Los Angeles Lakers': '/LOGOs/Los Angeles Lakers.png',
    'Memphis Grizzlies': '/LOGOs/Memphis Grizzlies.png',
    'Miami Heat': '/LOGOs/Miami Heat.png',
    'Milwaukee Bucks': '/LOGOs/Milwaukee Bucks.png',
    'Minnesota Timberwolves': '/LOGOs/Minnesota Timberwolves.png',
    'New Orleans Pelicans': '/LOGOs/New Orleans Pelicans.png',
    'New York Knicks': '/LOGOs/New York Knicks.png',
    'Oklahoma City Thunder': '/LOGOs/Oklahoma City Thunder.png',
    'Orlando Magic': '/LOGOs/Orlando Magic.png',
    'Philadelphia 76ers': '/LOGOs/Philadelphia 76ers.png',
    'Phoenix Suns': '/LOGOs/Phoenix Suns.png',
    'Portland Trail Blazers': '/LOGOs/Portland Trail Blazers.png',
    'Sacramento Kings': '/LOGOs/Sacramento Kings.png',
    'San Antonio Spurs': '/LOGOs/San Antonio Spurs.png',
    'Toronto Raptors': '/LOGOs/Toronto Raptors.png',
    'Utah Jazz': '/LOGOs/Utah Jazz.png',
    'Washington Wizards': '/LOGOs/Washington Wizards.png',
    // Dodajte sve potrebne klubove
};

const Logo = ({ imeMomcad, visina }) => {
    const logoSrc = logos[imeMomcad];

    if (imeMomcad)
        return (
            <div>
                <img
                    src={logoSrc}
                    alt={`${imeMomcad} logo`}
                    style={{
                        marginTop: visina ? '500px' : '20px',
                        marginLeft: '10px',
                        width: 'auto',
                        height: visina ? '150vh' : '80px',
                        objectFit: visina ? 'cover' : '',
                    }}
                />
            </div>
        );
    else return null;
};

export default Logo;
