/* eslint-disable @typescript-eslint/no-unused-vars */

// import Icon from 'src/@core/components/icon'
// <Icon icon='basil:add-solid' />

import React, { useEffect, useRef, useState } from 'react'
import { TextField, Button, Autocomplete, ListItem, ListItemButton, CircularProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import { OptionType } from 'src/types/apps/calendarTypes'
import { Controller } from 'react-hook-form'

interface AutocompleteWithAddButtonProps {
  title: string
  fieldForm: string
  control: any
  selectedItem: any
  onAddEvent: () => void
  fetchDataOptions: (searchText: string) => any
  disabled?: boolean
  onChange?: (value: OptionType | null) => void
}

export const AutocompleteWithAddButton = React.forwardRef((props: AutocompleteWithAddButtonProps, ref: any) => {
  const { title, fieldForm, control, selectedItem, onAddEvent, fetchDataOptions, disabled, onChange } = props

  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState<OptionType[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null)

  const clearAutocomplete = (value: boolean) => {
    if (value) setSelectedOption(null)
  }

  useEffect(() => {
    if (ref) ref.current = { clearAutocomplete }
  }, [ref])

  useEffect(() => {
    if (selectedItem) {
      setSelectedOption(selectedItem)
    }
  }, [selectedItem])

  const fetchOptions = async (searchText: string) => {
    try {
      setLoading(true)
      if (searchText) {
        const data = await fetchDataOptions(searchText)
        setOptions(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error fetching options:', error)
      setLoading(false)
    }
  }

 const removeAccents = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const filterOptions = (options: OptionType[], state: any) => {
  const { inputValue } = state
  const normalizedInput = removeAccents(inputValue.toLowerCase())

  const filtered = options.filter(option =>
    removeAccents(option.name.toLowerCase()).includes(normalizedInput)
  )

  if (inputValue !== '' && filtered.length === 0) {
    return [{ id: 'add', name: `Cadastrar ${title}` }]
  }

  return filtered
}

  return (
      <Controller
      name={fieldForm}
      control={control}
      defaultValue={null}
      render={({ field }) => (
        <Autocomplete
          key={field.name}
          id={fieldForm}
          options={options}
          inputValue={inputValue}
          disabled={disabled}
           onChange={(event, newValue) => {
              setSelectedOption(newValue)
              field.onChange(newValue?.id || null) // integra com react-hook-form
              if (onChange) onChange(newValue)     // callback externo
          }}
          onInputChange={(event, value) => {
            setInputValue(value)
            fetchOptions(value)
          }}
          filterOptions={filterOptions}
          getOptionLabel={option => option.name}
          
          renderOption={(props, option, { inputValue }) => {
            if (inputValue !== '' && option.id === 'add') {
              return (
                <ListItem {...props} key={option.id}>
                  <ListItemButton
                    onClick={event => {
                      event.stopPropagation()
                      onAddEvent()
                    }}
                  >
                    <Button
                      variant='contained'
                      color='primary'
                      startIcon={<Icon icon='basil:add-solid' />}
                      fullWidth
                    >
                      {option.name}
                    </Button>
                  </ListItemButton>
                </ListItem>
              )
            } else {
              return (
                <ListItem {...props} key={option.id}>
                  {option.name}
                </ListItem>
              )
            }
          }}
          renderInput={params => (
            <TextField
              {...params}
              label={title}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading && <CircularProgress color='inherit' size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          value={selectedOption}
        />
      )}
    />
  )
})
