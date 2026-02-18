import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const Form = ({
                  onSubmit,
                  children,
                  className = '',
                  validationSchema
              }) => {
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Validation
        if (validationSchema) {
            const validationErrors = {};

            Object.keys(validationSchema).forEach(field => {
                const rules = validationSchema[field];
                const value = data[field];

                if (rules.required && !value) {
                    validationErrors[field] = rules.message || 'Ce champ est requis';
                }

                if (rules.minLength && value && value.length < rules.minLength) {
                    validationErrors[field] = `Minimum ${rules.minLength} caractères`;
                }

                if (rules.maxLength && value && value.length > rules.maxLength) {
                    validationErrors[field] = `Maximum ${rules.maxLength} caractères`;
                }

                if (rules.pattern && value && !rules.pattern.test(value)) {
                    validationErrors[field] = rules.message || 'Format invalide';
                }

                if (rules.custom && value) {
                    const customError = rules.custom(value, data);
                    if (customError) {
                        validationErrors[field] = customError;
                    }
                }
            });

            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
        }

        setErrors({});
        onSubmit && onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child) && child.props.name) {
                    return React.cloneElement(child, {
                        error: errors[child.props.name]
                    });
                }
                return child;
            })}
        </form>
    );
};

// FormGroup Component
export const FormGroup = ({
                              label,
                              children,
                              error,
                              required = false,
                              helperText,
                              className = ''
                          }) => {
    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            {children}
            {error && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                </div>
            )}
            {helperText && !error && (
                <p className="mt-1 text-sm text-gray-500">{helperText}</p>
            )}
        </div>
    );
};

// Textarea Component
export const Textarea = ({
                             label,
                             error,
                             helperText,
                             required = false,
                             rows = 4,
                             className = '',
                             ...props
                         }) => {
    return (
        <FormGroup label={label} error={error} helperText={helperText} required={required}>
      <textarea
          rows={rows}
          className={`
          w-full px-3 py-2 border rounded-lg resize-none
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
          {...props}
      />
        </FormGroup>
    );
};

// Checkbox Component
export const Checkbox = ({
                             label,
                             checked,
                             onChange,
                             disabled = false,
                             className = '',
                             ...props
                         }) => {
    return (
        <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                {...props}
            />
            {label && (
                <span className="ml-2 text-sm text-gray-700">{label}</span>
            )}
        </label>
    );
};

// Radio Component
export const Radio = ({
                          label,
                          checked,
                          onChange,
                          disabled = false,
                          className = '',
                          ...props
                      }) => {
    return (
        <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <input
                type="radio"
                checked={checked}
                onChange={(e) => onChange && onChange(e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                {...props}
            />
            {label && (
                <span className="ml-2 text-sm text-gray-700">{label}</span>
            )}
        </label>
    );
};

// RadioGroup Component
export const RadioGroup = ({
                               options,
                               value,
                               onChange,
                               label,
                               error,
                               orientation = 'vertical',
                               className = ''
                           }) => {
    return (
        <FormGroup label={label} error={error}>
            <div className={`${orientation === 'vertical' ? 'space-y-2' : 'flex space-x-4'} ${className}`}>
                {options.map((option) => (
                    <Radio
                        key={option.value}
                        label={option.label}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                        disabled={option.disabled}
                    />
                ))}
            </div>
        </FormGroup>
    );
};

export default Form;