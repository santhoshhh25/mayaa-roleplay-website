import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Try to get synced data from FiveM server first
    try {
      const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/sync-players`, {
        method: 'GET'
      })
      
      if (syncResponse.ok) {
        const syncData = await syncResponse.json()
        
        if (syncData.success && syncData.players && syncData.players.length > 0) {
          // Return real data from FiveM server
          const limitedPlayers = syncData.players.slice(0, limit)
          
          return NextResponse.json({
            success: true,
            data: limitedPlayers,
            total: limitedPlayers.length,
            source: 'fivem_server',
            lastSync: syncData.lastSync,
            serverName: syncData.serverName
          })
        }
      }
    } catch (syncError) {
      console.log('Sync data not available, falling back to mock data')
    }

    // Fallback to mock data if sync data is not available
    const mockPlayerData = [
      {
        id: '1',
        name: 'Raja Reddy',
        cash: 2850000,
        bank: 12750000,
        totalWealth: 15600000,
        rank: 'Diamond Elite',
        avatar: 'https://i.pinimg.com/736x/77/4d/27/774d2791d7a6f7d98e2c711c272c4c6b.jpg'
      },
      {
        id: '2', 
        name: 'Krishna Sharma',
        cash: 1950000,
        bank: 11200000,
        totalWealth: 13150000,
        rank: 'Platinum King',
        avatar: 'https://i.pinimg.com/736x/c6/07/69/c60769c88ab2549a9982e6090c3c46ed.jpg'
      },
      {
        id: '3',
        name: 'Arjun Patel',
        cash: 3200000,
        bank: 9800000,
        totalWealth: 13000000,
        rank: 'Gold Legend',
        avatar: 'https://i.pinimg.com/736x/7e/a1/ff/7ea1ffa773831a72596458aa70146b8c.jpg'
      },
      {
        id: '4',
        name: 'Vikram Singh',
        cash: 1750000,
        bank: 10100000,
        totalWealth: 11850000,
        rank: 'Elite Master'
      },
      {
        id: '5',
        name: 'Ravi Kumar',
        cash: 2100000,
        bank: 8950000,
        totalWealth: 11050000,
        rank: 'Rising Star'
      }
    ]

    const limitedMockData = mockPlayerData.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: limitedMockData,
      total: limitedMockData.length,
      source: 'mock_data',
      message: 'Using mock data. Real data will appear once FiveM server sync is setup.'
    })
    
  } catch (error) {
    console.error('Elite players API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch elite players data',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
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

export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Method not allowed' 
    },
    { status: 405 }
  )
} 