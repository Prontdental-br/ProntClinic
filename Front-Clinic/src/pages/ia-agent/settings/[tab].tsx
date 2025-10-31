// ** Next Import
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Third Party Imports
import axios from 'axios'

// ** Types
import { PricingDataType } from 'src/@core/components/plan-details/types'

// ** Demo Components Imports
import AccountSettings from 'src/views/pages/account-settings/AccountSettings'
import AgentIASettings from 'src/views/pages/agent-ia-settings/AgentIASettings'

const AgentIASettingsTab = ({ tab, apiPricingPlanData }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <AgentIASettings tab={tab}  />
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'create' } },
      { params: { tab: 'business' } },
      { params: { tab: 'billing' } },
      { params: { tab: 'topics' } },
      { params: { tab: 'behavior' } },
      { params: { tab: 'treatment' } },
 
      
      { params: { tab: 'connect-whatsapp' } },
    ],
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  // const res = await axios.get('/pages/pricing')
  // const data: PricingDataType = res.data

  return {
    props: {
      tab: params?.tab,
    
    }
  }
}

export default AgentIASettingsTab