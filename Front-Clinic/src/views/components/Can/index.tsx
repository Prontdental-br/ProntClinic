const rules: any = {
  user: {
    static: []
  },

  admin: {
    static: [
      'dashboard:view',
      'drawer-admin-items:view',
      'tickets-manager:showall',
      'user-modal:editProfile',
      'user-modal:editQueues',
      'ticket-options:deleteTicket',
      'contacts-page:deleteContact',
      'connections-page:actionButtons',
      'connections-page:addConnection',
      'connections-page:editOrDeleteConnection'
    ]
  }
}

const check = (role: string, action: any, data: any) => {
  const permissions = rules[role]
  if (!permissions) {
    // role is not present in the rules
    return false
  }

  const staticPermissions = permissions.static

  if (staticPermissions && staticPermissions.includes(action)) {
    // static rule not provided for action
    return true
  }

  const dynamicPermissions = permissions.dynamic

  if (dynamicPermissions) {
    const permissionCondition = dynamicPermissions[action]
    if (!permissionCondition) {
      // dynamic rule not provided for action
      return false
    }

    return permissionCondition(data)
  }

  return false
}

const Can = ({ role, perform, data, yes, no }: any) => (check(role, perform, data) ? yes() : no())

Can.defaultProps = {
  yes: () => null,
  no: () => null
}

export { Can }
