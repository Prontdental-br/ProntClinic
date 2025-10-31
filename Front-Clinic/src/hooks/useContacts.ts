import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import translateBackendError from 'src/common/translateBackendError'
import prontChatApi from 'src/views/pages/account-settings/tabConnectWhatsapp/ProntChatApi'

const useContacts = ({ searchParam, pageNumber, date, dateStart, dateEnd }: any) => {
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [contacts, setContacts] = useState([])
  const [count, setCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await prontChatApi.get('/contacts', {
            params: {
              searchParam,
              pageNumber,
              date,
              dateStart,
              dateEnd
            }
          })
          setContacts(data.contacts)

          setHasMore(data.hasMore)
          setCount(data.count)
          setLoading(false)
        } catch (err: any) {
          setLoading(false)
          const errorMsg = err.response?.data?.error;
          if (errorMsg) {
            toast.error(translateBackendError(errorMsg));
          }
        }
      }

      fetchContacts()
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchParam, pageNumber, date, dateStart, dateEnd])

  return { contacts, loading, hasMore, count }
}

export default useContacts
