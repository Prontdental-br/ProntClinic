// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

import { ToastContainer } from 'react-toastify'

// Type Imports
import type { ChildrenType } from '@core/types'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: 'Clairis - Painel Admin',
  description: 'Clairis software - Painel Admin',
}

const RootLayout = ({ children }: ChildrenType) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}

export default RootLayout
