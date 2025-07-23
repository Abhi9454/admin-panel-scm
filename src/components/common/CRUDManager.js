// components/common/CRUDManager.js - Generic CRUD component
import React, { useEffect, useCallback, useMemo } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CForm, CRow } from '@coreui/react'
import { useApiCall, useFormValidation } from 'src/hooks'
import { LoadingButton, FormInput, ErrorMessage } from '../common'
import { CRUDTable } from 'src/components/common/CRUDTable'
import apiService from '../../api/schoolManagementApi'

export const CRUDManager = React.memo(
  ({
    config, // Configuration object with entity details
    className = '',
    onSuccess, // Optional callback for successful operations
    onError, // Optional callback for errors
  }) => {
    // Validation rules for the form
    const validationRules = useMemo(
      () => ({
        name: {
          required: true,
          message: `${config.entityName} name is required`,
          minLength: 2,
          minLengthMessage: `${config.entityName} name must be at least 2 characters`,
          maxLength: 100,
          maxLengthMessage: `${config.entityName} name must be less than 100 characters`,
        },
        sequenceNumber: {
          required: true,
          message: 'Sequence number is required',
          pattern: /^\d+$/,
          patternMessage: 'Sequence number must be a positive number',
          validator: (value) => {
            const num = parseInt(value)
            if (num < 1) return 'Sequence number must be greater than 0'
            if (num > 999) return 'Sequence number must be less than 1000'
            return ''
          },
        },
      }),
      [config.entityName],
    )

    // Form state management
    const { values, errors, setValue, setFieldTouched, validateAll, resetForm } = useFormValidation(
      { name: '', sequenceNumber: '', editingId: null },
      validationRules,
      { validateOnBlur: true },
    )

    // API calls with enhanced error handling
    const {
      loading: fetchLoading,
      error: fetchError,
      data: items,
      executeCall: executeFetch,
    } = useApiCall({
      onSuccess: (data) => {
        console.log(`${config.entityName}s loaded successfully`)
        if (onSuccess) onSuccess('fetch', data)
      },
      onError: (error) => {
        console.error(`Error fetching ${config.entityName}s:`, error)
        if (onError) onError('fetch', error)
      },
    })

    const {
      loading: submitLoading,
      error: submitError,
      executeCall: executeSubmit,
    } = useApiCall({
      onSuccess: () => {
        resetForm()
        fetchItems() // Refresh the list
        if (onSuccess) onSuccess(values.editingId ? 'update' : 'create')
      },
      onError: (error) => {
        console.error(`Error saving ${config.entityName}:`, error)
        if (onError) onError('save', error)
      },
    })

    const { loading: deleteLoading, executeCall: executeDelete } = useApiCall({
      onSuccess: () => {
        fetchItems() // Refresh the list
        if (onSuccess) onSuccess('delete')
      },
      onError: (error) => {
        console.error(`Error deleting ${config.entityName}:`, error)
        if (onError) onError('delete', error)
      },
    })

    // Fetch items on component mount
    const fetchItems = useCallback(() => {
      executeFetch(
        () => apiService.getAll(config.endpoints.getAll),
        `Failed to load ${config.entityName}s. Please try again.`,
      )
    }, [executeFetch, config.endpoints.getAll, config.entityName])

    useEffect(() => {
      fetchItems()
    }, [fetchItems])

    // Handle form submission
    const handleSubmit = useCallback(
      async (e) => {
        e.preventDefault()

        if (!validateAll()) {
          return
        }

        const payload = {
          name: values.name.trim(),
          sequenceNumber: parseInt(values.sequenceNumber),
        }

        await executeSubmit(
          () => {
            if (values.editingId) {
              return apiService.update(config.endpoints.update, values.editingId, payload)
            } else {
              return apiService.create(config.endpoints.create, payload)
            }
          },
          `Failed to ${values.editingId ? 'update' : 'create'} ${config.entityName}. Please try again.`,
        )
      },
      [validateAll, values, executeSubmit, config],
    )

    // Handle edit action
    const handleEdit = useCallback(
      (item) => {
        setValue('name', item.name)
        setValue('sequenceNumber', item.sequenceNumber.toString())
        setValue('editingId', item.id)
      },
      [setValue],
    )

    // Handle delete action
    const handleDelete = useCallback(
      async (id) => {
        if (
          window.confirm(`Are you sure you want to delete this ${config.entityName.toLowerCase()}?`)
        ) {
          await executeDelete(
            () => apiService.delete(`${config.endpoints.delete}/${id}`),
            `Failed to delete ${config.entityName}. Please try again.`,
          )
        }
      },
      [executeDelete, config],
    )

    // Handle clear/cancel action
    const handleClear = useCallback(() => {
      resetForm()
    }, [resetForm])

    // Handle input changes
    const handleInputChange = useCallback(
      (field) => (e) => {
        const value = e.target.value
        setValue(field, value)
      },
      [setValue],
    )

    const handleInputBlur = useCallback(
      (field) => () => {
        setFieldTouched(field, true)
      },
      [setFieldTouched],
    )

    const isEditing = !!values.editingId
    const isSubmitDisabled = submitLoading || deleteLoading

    return (
      <CRow className={className}>
        <CCol xs={12}>
          {/* Form Card */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>
                {isEditing ? `Edit ${config.entityName}` : `Add New ${config.entityName}`}
              </strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={handleSubmit} noValidate>
                {/* Display API errors */}
                <ErrorMessage error={submitError} className="mb-3 text-danger" />

                <FormInput
                  label={`${config.entityName} Name`}
                  id="name"
                  placeholder={`Enter ${config.entityName} Name`}
                  value={values.name}
                  onChange={handleInputChange('name')}
                  onBlur={handleInputBlur('name')}
                  error={errors.name}
                  disabled={isSubmitDisabled}
                  required
                  maxLength={100}
                />

                <FormInput
                  label="Sequence Number"
                  type="number"
                  id="sequenceNumber"
                  placeholder="Enter Sequence Number"
                  value={values.sequenceNumber}
                  onChange={handleInputChange('sequenceNumber')}
                  onBlur={handleInputBlur('sequenceNumber')}
                  error={errors.sequenceNumber}
                  disabled={isSubmitDisabled}
                  required
                  min={1}
                  max={999}
                />

                <div className="d-flex gap-2">
                  <LoadingButton
                    type="submit"
                    color={isEditing ? 'warning' : 'success'}
                    loading={submitLoading}
                    loadingText={isEditing ? 'Updating...' : 'Adding...'}
                    disabled={isSubmitDisabled}
                  >
                    {isEditing ? `Update ${config.entityName}` : `Add ${config.entityName}`}
                  </LoadingButton>

                  {isEditing && (
                    <LoadingButton
                      type="button"
                      color="secondary"
                      onClick={handleClear}
                      disabled={isSubmitDisabled}
                    >
                      Cancel
                    </LoadingButton>
                  )}
                </div>
              </CForm>
            </CCardBody>
          </CCard>

          {/* Table Card */}
          <CCard className="mb-4">
            <CCardHeader>
              <strong>All {config.entityNamePlural}</strong>
            </CCardHeader>
            <CCardBody>
              {/* Display fetch errors */}
              <ErrorMessage error={fetchError} className="mb-3 text-danger" />

              <CRUDTable
                items={items || []}
                loading={fetchLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleteLoading={deleteLoading}
                entityName={config.entityName}
                columns={config.tableColumns}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  },
)

CRUDManager.displayName = 'CRUDManager'
