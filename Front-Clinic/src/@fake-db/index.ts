import mock from './mock'

import './auth/jwt'
import './pages/pricing'
import './pages/partners'

mock.onAny().passThrough()
