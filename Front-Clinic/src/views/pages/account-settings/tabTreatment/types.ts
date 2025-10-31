export type TreatmentsDataType = {
  id: number
  name: string
  desc: string
  treatmentCost: number
  treatmentValue: number
  active: boolean
  speciality: SpecialityDataType
}

export type SpecialityDataType = {
  id: number
  name: string
  desc: string
  active: boolean
}
