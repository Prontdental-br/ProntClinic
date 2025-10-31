'use client'

import { useRouter } from 'next/router';

// ** Next Import
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from 'next/types'

// ** Demo Components Imports
import UserViewPage from 'src/views/apps/user/view/UserViewPage'

const UserView = ({ id, query, tab, invoiceData }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { exam_type } = router.query;
  
return <UserViewPage id={id} tab={tab} exam_type={exam_type as string} />
  
}

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [
      { params: { tab: 'about', id: '0' } },
      { params: { tab: 'treatment', id: '0' } },
      { params: { tab: 'budget', id: '0' } },
      { params: { tab: 'anamnese', id: '0' } },
      { params: { tab: 'documents', id: '0' } },
      { params: { tab: 'debts', id: '0' } }
    ],
    fallback: true
  }
}

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  try {
    return {
      props: {
        tab: params?.tab,
        id: params?.id
      }
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)
    throw error
  }
}

export default UserView
