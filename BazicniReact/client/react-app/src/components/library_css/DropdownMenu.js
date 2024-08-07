import React, { useState } from 'react';
import './css/dropdownmenu.css';

const DropdownMenu = ({ items, odabir, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [clicked, setClicked] = useState('');
    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="dropdown">
            <button onClick={handleButtonClick}>
                {clicked ? clicked : odabir}
            </button>
            {isOpen && (
                <div className="dropdown-menu" onMouseLeave={handleButtonClick}>
                    {items.length > 0 ? (
                        <div className="button-container">
                            {items.map((item, index) => (
                                <button
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => {
                                        onSelect(item);
                                        setIsOpen(false);
                                        setClicked(item);
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p>No items available</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
