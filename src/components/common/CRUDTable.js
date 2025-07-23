import React from 'react'
import {
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
  CButtonGroup,
} from '@coreui/react'
import { LoadingButton } from './LoadingButton'

export const CRUDTable = React.memo(
  ({
    items = [],
    loading = false,
    onEdit,
    onDelete,
    deleteLoading = false,
    entityName = 'Item',
    columns = [],
    emptyMessage,
  }) => {
    // Show loading state
    if (loading) {
      return (
        <div className="text-center py-4">
          <CSpinner color="primary" />
          <p className="mt-2 text-muted">Loading {entityName.toLowerCase()}s...</p>
        </div>
      )
    }

    // Show empty state
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">
            {emptyMessage || `No ${entityName.toLowerCase()}s found. Add one to get started.`}
          </p>
        </div>
      )
    }

    return (
      <CTable hover responsive>
        <CTableHead>
          <CTableRow>
            {columns.map((column) => (
              <CTableHeaderCell
                key={column.key}
                scope="col"
                className={column.headerClassName}
                style={column.headerStyle}
              >
                {column.header}
              </CTableHeaderCell>
            ))}
            <CTableHeaderCell scope="col" className="text-center">
              Actions
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {items.map((item) => (
            <CTableRow key={item.id}>
              {columns.map((column) => (
                <CTableDataCell
                  key={column.key}
                  className={column.cellClassName}
                  style={column.cellStyle}
                >
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </CTableDataCell>
              ))}
              <CTableDataCell className="text-center">
                <CButtonGroup size="sm">
                  <CButton
                    color="warning"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    disabled={deleteLoading}
                    title={`Edit ${entityName.toLowerCase()}`}
                  >
                    Edit
                  </CButton>
                  <LoadingButton
                    color="danger"
                    variant="outline"
                    onClick={() => onDelete(item.id)}
                    loading={deleteLoading}
                    loadingText=""
                    disabled={deleteLoading}
                    title={`Delete ${entityName.toLowerCase()}`}
                  >
                    Delete
                  </LoadingButton>
                </CButtonGroup>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    )
  },
)

CRUDTable.displayName = 'CRUDTable'
