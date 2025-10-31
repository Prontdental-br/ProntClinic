export type PricingPlanType = {
  active: boolean
  title: string
  imgSrc: string
  subtitle: string
  imgWidth?: number
  imgHeight?: number
  secondButton?: boolean
  titleSecondButton?: string
  imgBanner?: string
  whatsAppNumber?: string
  idVideo?: string
  isModalOnClick?: boolean
  currentPlan: boolean
  popularPlan: boolean
  viewPrice: boolean
  titleInPrice?: string
  customView: boolean
  titleButton: string
  customLabel: boolean
  customLabelText?: string
  monthlyPrice: string
  customLabelDiscount: boolean
  customLabelDesountText: string
  planBenefits: string[]
  categoryIDPrice: number
  categoryLabelPrice: string
  yearlyPlan: {
    perMonth: number
    totalAnnual: number
  }
}

export type PricingPlanProps = {
  plan: string
  data?: PricingPlanType
}

export type PricingFaqType = {
  id: string
  answer: string
  question: string
}

export type PricingTableRowType = { feature: string; starter: boolean; pro: boolean | string; enterprise: boolean }

export type PricingTableType = {
  header: { title: string; subtitle: string; isPro?: boolean }[]
  rows: PricingTableRowType[]
}

export type PricingDataType = {
  faq: PricingFaqType[]
  pricingTable: PricingTableType
  pricingPlans: PricingPlanType[]
}
