export enum TypeEnum {
    credit = 'C',
    debit = 'D',
}

export interface ExpenseData {
    description: string
    id?: string
    value: number
    type: TypeEnum
    referenceDate: string
    paymentType: string | null
    paymentDate: string | undefined
    dueDate: string
    isPaid: boolean
    observation: string
    accountId?: string
    attachments?: string[]
} 