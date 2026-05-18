import { useState } from 'react';

/**
 * Custom hook for handling form state.
 * Reduces repetitive state logic for forms.
 * 
 * @param {Object} initialValues - The initial state of the form fields.
 * @returns {Array} [values, handleChange, resetForm, setValues]
 */
export const useForm = (initialValues = {}) => {
    const [values, setValues] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues({
            ...values,
            [name]: value
        });
    };

    const resetForm = () => {
        setValues(initialValues);
    };

    return [values, handleChange, resetForm, setValues];
};
