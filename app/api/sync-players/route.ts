import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const API_KEY = process.env.FIVEM_SYNC_API_KEY || 'your-secure-api-key-here'
const DATA_FILE = path.join(process.cwd(), 'data', 'elite-players.json')

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(DATA_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

export async function POST(request: Request) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    const providedKey = authHeader?.replace('Bearer ', '')
    
    if (providedKey !== API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { players, timestamp, serverName } = body

    if (!players || !Array.isArray(players)) {
      return NextResponse.json(
        { success: false, error: 'Invalid players data' },
        { status: 400 }
      )
    }

    // Ensure data directory exists
    await ensureDataDirectory()

    // Transform and validate player data
    const transformedPlayers = players.map((player: any, index: number) => ({
      id: player.identifier || `player_${index + 1}`,
      name: player.name || 'Unknown Player',
      cash: parseInt(player.cash) || 0,
      bank: parseInt(player.bank) || 0,
      totalWealth: parseInt(player.totalWealth) || (parseInt(player.cash) || 0) + (parseInt(player.bank) || 0),
      isOnline: player.isOnline || false,
      rank: getRankByPosition(index + 1),
      avatar: getDefaultAvatar(index),
      lastUpdated: new Date().toISOString()
    }))

    // Sort by total wealth
    transformedPlayers.sort((a, b) => b.totalWealth - a.totalWealth)

    // Prepare data to save
    const dataToSave = {
      players: transformedPlayers,
      lastSync: new Date().toISOString(),
      serverName: serverName || 'MAYAAALOKAM Server',
      totalPlayers: transformedPlayers.length
    }

    // Save to file
    await fs.writeFile(DATA_FILE, JSON.stringify(dataToSave, null, 2))

    console.log(`✅ Elite players data synced: ${transformedPlayers.length} players`)

    return NextResponse.json({
      success: true,
      message: `Synced ${transformedPlayers.length} players successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Sync players API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to sync players data',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Return stored player data
    await ensureDataDirectory()
    
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf-8')
      const data = JSON.parse(fileContent)
      
      return NextResponse.json({
        success: true,
        ...data
      })
    } catch {
      // Return empty data if file doesn't exist
      return NextResponse.json({
        success: true,
        players: [],
        lastSync: null,
        serverName: 'MAYAAALOKAM Server',
        totalPlayers: 0,
        message: 'No player data available. Waiting for FiveM server sync...'
      })
    }

  } catch (error) {
    console.error('Get sync data error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve player data' },
      { status: 500 }
    )
  }
}

function getRankByPosition(position: number): string {
  const ranks = [
    'Diamond Elite',
    'Platinum King', 
    'Gold Legend',
    'Elite Master',
    'Rising Star',
    'High Roller',
    'Wealthy Elite',
    'Money Maker',
    'Cash King',
    'Elite Member'
  ]
  
  return ranks[position - 1] || 'Elite Player'
}

function getDefaultAvatar(index: number): string {
  const avatars = [
    'https://i.pinimg.com/736x/77/4d/27/774d2791d7a6f7d98e2c711c272c4c6b.jpg',
    'https://i.pinimg.com/736x/c6/07/69/c60769c88ab2549a9982e6090c3c46ed.jpg',
    'https://i.pinimg.com/736x/7e/a1/ff/7ea1ffa773831a72596458aa70146b8c.jpg'
  ]
  
  return avatars[index % avatars.length] || avatars[0]
} 