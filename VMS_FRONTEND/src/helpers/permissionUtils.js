export const hasPermission = (user, permissions) => {
    // Check if user and permissions exist
    if (user && user.permissions && user.permissions[0]?.permission_list) {
      const permissionsArray = permissions.split('|').map(permission => permission);
      const currentUserPermissions = user.permissions[0].permission_list.map(permission => permission);

      // Check if any permission in currentUserPermissions is included in permissionsArray
      const hasPermission = currentUserPermissions.some(permission =>  
           permissionsArray.includes(permission)
      );

      return hasPermission 
    }
    return false;
};