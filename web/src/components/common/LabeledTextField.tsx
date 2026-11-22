'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'
import { FormControl, FormLabel, TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material'

interface LabeledTextFieldProps extends Omit<TextFieldProps, 'label'> {
  label: string
  children?: ReactNode
}

export function LabeledTextField({
  children,
  disabled,
  error,
  fullWidth,
  id,
  label,
  required,
  sx,
  ...textFieldProps
}: LabeledTextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <FormControl
      disabled={disabled}
      error={error}
      fullWidth={fullWidth}
      required={required}
      sx={sx}
    >
      <FormLabel htmlFor={inputId} sx={{ mb: 0.75 }}>
        {label}
      </FormLabel>
      <TextField
        {...textFieldProps}
        id={inputId}
        disabled={disabled}
        error={error}
        fullWidth={fullWidth}
        required={required}
      >
        {children}
      </TextField>
    </FormControl>
  )
}
