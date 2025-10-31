// ** Next Import
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Third Party Imports
import axios from 'axios'

// ** Types
import { PricingDataType } from 'src/@core/components/plan-details/types'
import Chat from 'src/views/pages/chat-settings/Chat'

// ** Demo Components Imports
// import AccountSettings from 'src/views/pages/account-settings/AccountSettings'
// import AgentIASettings from 'src/views/pages/agent-ia-settings/AgentIASettings'

const ChatSettingsTab = ({ tab, apiPricingPlanData }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <Chat tab={tab} />
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'conversation' } },
      { params: { tab: 'oportunity' } },

      // { params: { tab: 'billing' } },
      // { params: { tab: 'topics' } },
      // { params: { tab: 'behavior' } },
      // { params: { tab: 'treatment' } },

      //   { params: { tab: 'import-patients' } },
      { params: { tab: 'connect-whatsapp' } }
    ],
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  // const res = await axios.get('/pages/pricing')
  // const data: PricingDataType = res.data

  return {
    props: {
      tab: params?.tab
    }
  }
}

ChatSettingsTab.aclAbilities = { action: 'read', subject: 'chat' }

// ChatSettingsTab.requiredRole = 'admin'
ChatSettingsTab.requiredPlan = 'P'

export default ChatSettingsTab
