import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { ReactElement } from 'react'

interface IdCodeProps {
  id: string
  name: string
}

interface SelectMenuItemProps {
  options: IdCodeProps[]
  label: string
  value: string
  onChange: (item: SelectChangeEvent<string>) => void
}

const SelectMenuItem = ({ options, label, value, onChange }: SelectMenuItemProps) => {
  return (
    <FormControl fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select value={value} onChange={onChange} label={label}>
        {options.map(option => (
          <MenuItem key={option.id} value={option.id}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default SelectMenuItem
