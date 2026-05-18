import { useState, useEffect, useRef } from "react";

/**
 * CustomSelect Component
 * A custom styled select dropdown for better visual integration.
 * 
 * @param {Array} options - Array of objects with { value, label }
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback function when value changes
 * @param {string} label - Default label when no value is selected
 */
function CustomSelect({ options, value, onChange, label }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="custom_select_container" ref={selectRef}>
            <div className={`custom_select_trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedOption ? selectedOption.label : label}</span>
                <i className={`fa-solid fa-chevron-down ${isOpen ? 'rotate' : ''}`}></i>
            </div>
            {isOpen && (
                <ul className="custom_select_options">
                    {options.map(option => (
                        <li 
                            key={option.value} 
                            className={option.value === value ? 'selected' : ''}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default CustomSelect;
