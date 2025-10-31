class FormatMask {
  setPhoneFormatMask(phoneToFormat: string) {
    if (!phoneToFormat || phoneToFormat.length < 12) {
      return
    }

    const number = ('' + phoneToFormat).replace(/\D/g, '')

    if (number.length <= 12) {
      const phoneNumberFormatted = number.match(/^(\d{2})(\d{2})(\d{4})(\d{4})$/)
      if (phoneNumberFormatted) {
        return (
          '+' +
          phoneNumberFormatted[1] +
          ' (' +
          phoneNumberFormatted[2] +
          ') ' +
          phoneNumberFormatted[3] +
          '-' +
          phoneNumberFormatted[4]
        )
      }
    } else if (number.length === 13) {
      const phoneNumberFormatted = number.match(/^(\d{2})(\d{2})(\d{5})(\d{4})$/)
      if (phoneNumberFormatted) {
        return (
          '+' +
          phoneNumberFormatted[1] +
          ' (' +
          phoneNumberFormatted[2] +
          ') ' +
          phoneNumberFormatted[3] +
          '-' +
          phoneNumberFormatted[4]
        )
      }
    }

    return null
  }

  removeMask(number: string) {
    const filterNumber = number.replace(/\D/g, '')
  
    return filterNumber
  }

  maskPhonePattern(phoneNumber: string) {
    if (phoneNumber.length < 13) {
      return '+55 (99) 9999 9999'
    } else {
      return '+55 (99) 99999 9999'
    }
  }
}

export { FormatMask }
