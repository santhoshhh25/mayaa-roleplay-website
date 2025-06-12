// Admin authentication helper for duty logs panel
export class AdminAuth {
  // List of Discord role IDs that have admin access
  private static readonly adminRoles = [
    '1382104576139858041', // Admin role
    '1380074287104266318', // Chief/Leadership roles
    // Add more admin role IDs here
  ]

  // List of Discord user IDs that have admin access (fallback)
  private static readonly adminUsers = [ '1284925883240550552'
    // Add specific Discord user IDs here for admin access
    // Example: '123456789012345678'
    // Add your Discord user ID here to grant yourself admin access:
    // 'YOUR_DISCORD_USER_ID_HERE'
  ]

  /**
   * Check if a Discord user has admin privileges
   * @param discordId - Discord user ID
   * @param userRoles - Array of user's Discord role IDs (optional)
   * @returns Promise<boolean> - Whether user has admin access
   */
  static async hasAdminAccess(discordId: string, userRoles?: string[]): Promise<boolean> {
    try {
      // Check if user is in admin users list
      if (this.adminUsers.includes(discordId)) {
        return true
      }

      // Check if user has any admin roles
      if (userRoles && userRoles.length > 0) {
        const hasAdminRole = userRoles.some(roleId => this.adminRoles.includes(roleId))
        if (hasAdminRole) {
          return true
        }
      }

      // PRODUCTION SECURITY: Only allow users with proper roles or in admin list
      console.log(`Admin access denied for ${discordId}: No admin roles or user not in admin list`)
      return false

    } catch (error) {
      console.error('Admin access check error:', error)
      return false
    }
  }

  /**
   * Get admin role requirements for display
   * @returns Array of role names that have admin access
   */
  static getAdminRoleNames(): string[] {
    return [
      'Administrator',
      'Management',
      'Chief',
      'Leadership Team'
    ]
  }

  /**
   * Check if current environment allows admin access
   * @returns boolean
   */
  static isAdminEnabled(): boolean {
    // Enable admin panel in development or if specifically enabled
    return process.env.NODE_ENV === 'development' || 
           process.env.NEXT_PUBLIC_ADMIN_ENABLED === 'true'
  }
} 