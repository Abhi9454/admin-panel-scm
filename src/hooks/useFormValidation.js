import { useState, useCallback } from 'react'

export const useFormValidation = (initialValues, validationRules = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const validate = useCallback(
    (fieldName, value) => {
      const rule = validationRules[fieldName]
      if (!rule) return ''

      // Required validation
      if (rule.required && !value.trim()) {
        return rule.message || `${fieldName} is required`
      }

      // Pattern validation
      if (rule.pattern && value && !rule.pattern.test(value)) {
        return rule.patternMessage || `Invalid ${fieldName} format`
      }

      // Min length validation
      if (rule.minLength && value && value.length < rule.minLength) {
        return rule.minLengthMessage || `${fieldName} must be at least ${rule.minLength} characters`
      }

      // Max length validation
      if (rule.maxLength && value && value.length > rule.maxLength) {
        return (
          rule.maxLengthMessage || `${fieldName} must be no more than ${rule.maxLength} characters`
        )
      }

      // Custom validation function
      if (rule.custom && typeof rule.custom === 'function') {
        return rule.custom(value, values) || ''
      }

      return ''
    },
    [validationRules, values],
  )

  const setValue = useCallback(
    (fieldName, value) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }))

      // Clear error when user starts typing
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: '' }))
      }
    },
    [errors],
  )

  const setFieldTouched = useCallback((fieldName, isTouched = true) => {
    setTouched((prev) => ({ ...prev, [fieldName]: isTouched }))
  }, [])

  const validateField = useCallback(
    (fieldName, value) => {
      const error = validate(fieldName, value)
      setErrors((prev) => ({ ...prev, [fieldName]: error }))
      setFieldTouched(fieldName, true)
      return !error
    },
    [validate, setFieldTouched],
  )

  const validateAll = useCallback(() => {
    const newErrors = {}
    const newTouched = {}
    let isValid = true

    Object.keys(validationRules).forEach((fieldName) => {
      const error = validate(fieldName, values[fieldName] || '')
      newTouched[fieldName] = true
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(newTouched)
    return isValid
  }, [values, validate, validationRules])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  const setFieldError = useCallback((fieldName, error) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }))
  }, [])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateField,
    validateAll,
    resetForm,
    setFieldError,
    setErrors,
  }
}
