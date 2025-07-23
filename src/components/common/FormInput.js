import React from 'react'
import { CFormInput, CFormLabel, CInputGroup, CInputGroupText } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { ErrorMessage } from './ErrorMessage'

export const FormInput = React.memo(
  ({
    icon,
    error,
    value,
    onChange,
    onBlur,
    name,
    id,
    type = 'text',
    placeholder,
    autoComplete,
    disabled = false,
    required = false,
    maxLength,
    minLength,
    min,
    max,
    pattern,
    label, // New prop for label
    'aria-label': ariaLabel,
    className = '',
    inputGroupClassName = 'mb-3',
    size,
    ...props
  }) => {
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={inputGroupClassName}>
        {/* Label */}
        {label && (
          <CFormLabel htmlFor={inputId} className="mb-2">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </CFormLabel>
        )}

        {/* Input Group */}
        {icon ? (
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={icon} />
            </CInputGroupText>
            <CFormInput
              id={inputId}
              name={name}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              required={required}
              maxLength={maxLength}
              minLength={minLength}
              min={min}
              max={max}
              pattern={pattern}
              aria-label={ariaLabel || label || placeholder}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
              className={`${error ? 'is-invalid' : ''} ${className}`}
              size={size}
              {...props}
            />
          </CInputGroup>
        ) : (
          <CFormInput
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            minLength={minLength}
            min={min}
            max={max}
            pattern={pattern}
            aria-label={ariaLabel || label || placeholder}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={`${error ? 'is-invalid' : ''} ${className}`}
            size={size}
            {...props}
          />
        )}

        {/* Error Message */}
        <ErrorMessage error={error} id={`${inputId}-error`} role="alert" aria-live="polite" />
      </div>
    )
  },
)

FormInput.displayName = 'FormInput'
