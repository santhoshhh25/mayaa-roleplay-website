import express from 'express'
import { supabase } from './supabase-client'

const router = express.Router()

// Interface for player data from FiveM
interface FiveMPlayer {
    rank: number
    identifier: string
    name: string
    bank: number
    cash: number
    total: number
    lastUpdated: string
}

interface FiveMServerInfo {
    name: string
    maxPlayers: number
    timestamp: number
}

interface FiveMSyncData {
    players: FiveMPlayer[]
    serverInfo: FiveMServerInfo
}

// Middleware to verify FiveM API key
const verifyFiveMApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization
    const expectedApiKey = process.env.FIVEM_SYNC_API_KEY

    if (!expectedApiKey) {
        console.error('FIVEM_SYNC_API_KEY not configured')
        return res.status(500).json({ error: 'Server configuration error' })
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const apiKey = authHeader.split(' ')[1]
    
    if (apiKey !== expectedApiKey) {
        console.warn('Invalid FiveM API key attempt:', apiKey.substring(0, 8) + '...')
        return res.status(401).json({ error: 'Invalid API key' })
    }

    next()
}

// POST endpoint to receive elite players data from FiveM server
router.post('/api/fivem/elite-players', verifyFiveMApiKey, async (req, res) => {
    try {
        const { players, serverInfo }: FiveMSyncData = req.body

        // Validate the data
        if (!players || !Array.isArray(players)) {
            return res.status(400).json({ 
                error: 'Invalid data format - players array required' 
            })
        }

        if (players.length === 0) {
            return res.status(400).json({ 
                error: 'No players data provided' 
            })
        }

        // Validate each player object
        for (const player of players) {
            if (!player.identifier || !player.name || typeof player.bank !== 'number' || typeof player.cash !== 'number') {
                return res.status(400).json({ 
                    error: 'Invalid player data format' 
                })
            }
        }

        console.log(`[FiveM Sync] Received ${players.length} elite players from ${serverInfo?.name || 'Unknown Server'}`)

        // Clear existing elite players data
        const { error: deleteError } = await supabase
            .from('elite_players')
            .delete()
            .neq('id', 0) // Delete all records

        if (deleteError) {
            console.error('Error clearing existing elite players:', deleteError)
            return res.status(500).json({ 
                error: 'Failed to clear existing data' 
            })
        }

        // Insert new elite players data
        const playersToInsert = players.map(player => ({
            rank: player.rank,
            identifier: player.identifier,
            character_name: player.name,
            bank_money: player.bank,
            cash_money: player.cash,
            total_money: player.total,
            last_updated: new Date(player.lastUpdated),
            sync_timestamp: new Date()
        }))

        const { error: insertError } = await supabase
            .from('elite_players')
            .insert(playersToInsert)

        if (insertError) {
            console.error('Error inserting elite players:', insertError)
            return res.status(500).json({ 
                error: 'Failed to save players data' 
            })
        }

        // Update server info if provided
        if (serverInfo) {
            const { error: serverError } = await supabase
                .from('server_info')
                .upsert({
                    id: 1, // Single server record
                    server_name: serverInfo.name,
                    max_players: serverInfo.maxPlayers,
                    last_sync: new Date(),
                    sync_timestamp: serverInfo.timestamp
                })

            if (serverError) {
                console.warn('Error updating server info:', serverError)
                // Don't fail the request for server info errors
            }
        }

        console.log(`[FiveM Sync] Successfully synced ${players.length} elite players`)

        res.json({
            success: true,
            message: `Successfully synced ${players.length} elite players`,
            playersCount: players.length,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('Error in FiveM elite players sync:', error)
        res.status(500).json({ 
            error: 'Internal server error' 
        })
    }
})

// GET endpoint to retrieve elite players data for the website
router.get('/api/fivem/elite-players', async (req, res) => {
    try {
        const { data: players, error } = await supabase
            .from('elite_players')
            .select('*')
            .order('rank', { ascending: true })
            .limit(10)

        if (error) {
            console.error('Error fetching elite players:', error)
            return res.status(500).json({ 
                error: 'Failed to fetch elite players data' 
            })
        }

        // Get server info
        const { data: serverInfo } = await supabase
            .from('server_info')
            .select('*')
            .eq('id', 1)
            .single()

        res.json({
            success: true,
            players: players || [],
            serverInfo: serverInfo || null,
            lastUpdated: players?.[0]?.sync_timestamp || null,
            totalPlayers: players?.length || 0
        })

    } catch (error) {
        console.error('Error fetching elite players:', error)
        res.status(500).json({ 
            error: 'Internal server error' 
        })
    }
})

// GET endpoint to check sync status
router.get('/api/fivem/sync-status', async (req, res) => {
    try {
        const { data: latestSync } = await supabase
            .from('elite_players')
            .select('sync_timestamp')
            .order('sync_timestamp', { ascending: false })
            .limit(1)
            .single()

        const { data: serverInfo } = await supabase
            .from('server_info')
            .select('*')
            .eq('id', 1)
            .single()

        const lastSyncTime = latestSync?.sync_timestamp
        const timeSinceSync = lastSyncTime ? Date.now() - new Date(lastSyncTime).getTime() : null
        const isStale = timeSinceSync ? timeSinceSync > 10 * 60 * 1000 : true // 10 minutes

        res.json({
            success: true,
            lastSync: lastSyncTime,
            timeSinceSync: timeSinceSync,
            isStale: isStale,
            serverInfo: serverInfo,
            status: isStale ? 'stale' : 'fresh'
        })

    } catch (error) {
        console.error('Error checking sync status:', error)
        res.status(500).json({ 
            error: 'Internal server error' 
        })
    }
})

export default router 