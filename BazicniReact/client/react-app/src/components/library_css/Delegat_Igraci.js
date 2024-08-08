// import react from 'react';
// import './css/delegat_igraci.css';

// const Delegat_Igraci = ({ igraci }) => {
//     console.log(igraci);
//     return (
//         <div className="del_igr_container">
//             <div className="del_igr_buttons">
//                 {igraci.map((igrac, index) => (
//                     <div className="del_igr_button_item" key={index}>
//                         <button>{igrac.BROJ_DRESA}</button>
//                         <p>{igrac.NAZIV}</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Delegat_Igraci;

import React from 'react';
import './css/delegat_igraci.css';

const Delegat_Igraci = ({ igraci }) => {
    console.log(igraci);
    return (
        <div className="del_igr_container">
            <div className="del_igr_buttons">
                {igraci.map((igrac, index) => (
                    <div className="del_igr_button_item" key={index}>
                        <div className="dres_ikona">
                            <img
                                src="/sport-shirt.png"
                                style={{ width: 'auto', height: '50px' }}
                            />
                            <span className="broj_dresa">
                                {igrac.BROJ_DRESA}
                            </span>
                        </div>
                        <p>{igrac.NAZIV}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Delegat_Igraci;
