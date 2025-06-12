// Discord OAuth configuration
const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
const REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

// Storage keys for persistent authentication
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'discord_access_token',
  USER_DATA: 'discord_user_data',
  TOKEN_EXPIRY: 'discord_token_expiry'
}

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  guilds?: DiscordGuild[]
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: string
}

export interface AuthSession {
  user: DiscordUser
  token: string
  expiresAt: number
}

export class DiscordAuth {
  static getAuthUrl(): string {
    if (!DISCORD_CLIENT_ID || !REDIRECT_URI || 
        DISCORD_CLIENT_ID.includes('your_discord_client_id_here') ||
        REDIRECT_URI.includes('your_discord_redirect_uri_here')) {
      throw new Error('Discord OAuth not configured')
    }

    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'identify guilds',
    })
    
    return `https://discord.com/api/oauth2/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('/api/discord/oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('Token exchange failed:', errorData)
      
      // Show detailed error message including Discord's response
      let errorMessage = 'Failed to exchange code for token'
      if (errorData.details) {
        try {
          const discordError = JSON.parse(errorData.details)
          errorMessage = `Discord token exchange failed: ${JSON.stringify(discordError)}`
        } catch {
          errorMessage = `Discord token exchange failed: ${errorData.details}`
        }
      }
      
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    
    // Store token with expiration (Discord tokens typically last 7 days)
    const expiresAt = Date.now() + (data.expires_in * 1000)
    this.storeToken(data.access_token, expiresAt)
    
    return data.access_token
  }

  static async getUser(accessToken: string): Promise<DiscordUser> {
    const response = await fetch('/api/discord/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    if (!response.ok) {
      // If token is invalid, clear stored data
      if (response.status === 401) {
        this.clearStoredAuth()
      }
      throw new Error('Failed to fetch user data')
    }
    
    const userData = await response.json()
    
    // Store user data for persistence
    this.storeUserData(userData)
    
    return userData
  }

  static async getUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
    const response = await fetch('/api/discord/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch user guilds')
    }
    
    return response.json()
  }

  // New persistent authentication methods
  static storeToken(token: string, expiresAt: number): void {
    if (typeof window === 'undefined') return // Server-side safety
    
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString())
    } catch (error) {
      console.warn('Failed to store authentication token:', error)
    }
  }

  static storeUserData(userData: DiscordUser): void {
    if (typeof window === 'undefined') return // Server-side safety
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData))
    } catch (error) {
      console.warn('Failed to store user data:', error)
    }
  }

  static getStoredToken(): string | null {
    if (typeof window === 'undefined') return null // Server-side safety
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
      
      if (!token || !expiryStr) return null
      
      const expiresAt = parseInt(expiryStr)
      if (Date.now() >= expiresAt) {
        // Token expired, clear storage
        this.clearStoredAuth()
        return null
      }
      
      return token
    } catch (error) {
      console.warn('Failed to retrieve stored token:', error)
      return null
    }
  }

  static getStoredUserData(): DiscordUser | null {
    if (typeof window === 'undefined') return null // Server-side safety
    
    try {
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA)
      if (!userDataStr) return null
      
      return JSON.parse(userDataStr)
    } catch (error) {
      console.warn('Failed to retrieve stored user data:', error)
      return null
    }
  }

  static getStoredSession(): AuthSession | null {
    const token = this.getStoredToken()
    const userData = this.getStoredUserData()
    const expiryStr = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
    
    if (!token || !userData || !expiryStr) return null
    
    return {
      user: userData,
      token,
      expiresAt: parseInt(expiryStr)
    }
  }

  static async validateStoredSession(): Promise<AuthSession | null> {
    const session = this.getStoredSession()
    if (!session) return null
    
    try {
      // Validate token by making a user API call
      const userData = await this.getUser(session.token)
      
      // Update stored user data with fresh data
      this.storeUserData(userData)
      
      return {
        user: userData,
        token: session.token,
        expiresAt: session.expiresAt
      }
    } catch (error) {
      // Token is invalid, clear storage
      console.warn('Stored session validation failed:', error)
      this.clearStoredAuth()
      return null
    }
  }

  static clearStoredAuth(): void {
    if (typeof window === 'undefined') return // Server-side safety
    
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER_DATA)
      localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
    } catch (error) {
      console.warn('Failed to clear stored authentication:', error)
    }
  }

  static isLoggedIn(): boolean {
    return this.getStoredToken() !== null
  }
} 