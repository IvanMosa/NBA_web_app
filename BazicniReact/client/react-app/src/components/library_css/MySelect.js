import Select from 'react-select';
import React from 'react';

const customStyles = {
    container: (provided) => ({
        ...provided,
        width: '100%',
        boxSizing: 'border-box',
    }),
    control: (provided) => ({
        ...provided,
        borderRadius: '6px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        border: '1px solid #ccc',
        fontSize: '16px',
        backgroundColor: '#fff',
        padding: '4px',
        height: 'auto', // Ensure it adjusts based on content
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: '6px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }),
    menuList: (provided) => ({
        ...provided,
        padding: 0,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
            ? '#007bff'
            : provided.backgroundColor,
        color: state.isSelected ? '#fff' : provided.color,
        cursor: 'pointer',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#333',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#aaa',
    }),
};

const MySelect = ({ options, value, onChange, className, placeholder }) => (
    <Select
        className={className ? className : null}
        styles={customStyles}
        options={options}
        value={value}
        onChange={onChange}
        isSearchable
        placeholder={placeholder}
    />
);

export default MySelect;
