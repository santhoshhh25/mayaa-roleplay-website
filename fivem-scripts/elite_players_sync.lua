-- MAYAAALOKAM Elite Players Sync Script for QBCore
-- This script syncs the wealthiest players from your FiveM server to the website

local config = {
    -- CONFIGURATION - CHANGE THESE VALUES
    websiteURL = 'https://your-backend-url.onrender.com', -- Your Render backend URL
    apiKey = 'your-secure-api-key-here', -- Must match FIVEM_SYNC_API_KEY in your .env
    syncInterval = 300000, -- 5 minutes (300,000 milliseconds)
    maxPlayers = 10, -- Top 10 players to sync
    
    -- QBCore Database settings (adjust for your database structure)
    -- Default values are for a standard QBCore setup.
    databaseResource = 'qb-core', -- Your QBCore resource name
    playersTable = 'players', -- Table containing player data
    moneyColumn = 'money', -- JSON column for money, e.g., '{"bank": 5000, "cash": 1000}'
    charinfoColumn = 'charinfo', -- JSON column for character info, e.g., '{"firstname": "John", "lastname": "Doe"}'
    identifierColumn = 'citizenid', -- Column name for player identifier
}

-- DO NOT EDIT BELOW THIS LINE UNLESS YOU KNOW WHAT YOU'RE DOING
local isQBCore = false
local QBCore = nil

-- Initialize QBCore
CreateThread(function()
    if GetResourceState(config.databaseResource) == 'started' then
        QBCore = exports[config.databaseResource]:GetCoreObject()
        if QBCore then
            isQBCore = true
            print('[MAYAAALOKAM] QBCore detected, elite players sync enabled')
        end
    end
    
    if not isQBCore then
        print('[MAYAAALOKAM] Warning: QBCore not detected, elite players sync disabled')
        print('[MAYAAALOKAM] Please check your configuration and ensure qb-core is started.')
    end
end)

-- Function to get elite players data
function GetElitePlayersData()
    if not isQBCore then
        print('[MAYAAALOKAM] Cannot get elite players data - QBCore not initialized')
        return nil
    end

    local players = {}
    
    -- Query to get top players by total money (bank + cash) from JSON fields
    -- This query assumes money and character info are stored in JSON columns.
    -- Adjust JSON paths ('$.bank', '$.cash', etc.) if your structure is different.
    local query = string.format([[
        SELECT 
            %s as identifier,
            JSON_UNQUOTE(JSON_EXTRACT(%s, '$.firstname')) as firstname,
            JSON_UNQUOTE(JSON_EXTRACT(%s, '$.lastname')) as lastname,
            CAST(JSON_EXTRACT(%s, '$.bank') AS SIGNED) as bank,
            CAST(JSON_EXTRACT(%s, '$.cash') AS SIGNED) as cash,
            (CAST(JSON_EXTRACT(%s, '$.bank') AS SIGNED) + CAST(JSON_EXTRACT(%s, '$.cash') AS SIGNED)) as total_money
        FROM %s 
        WHERE %s IS NOT NULL 
          AND JSON_EXTRACT(%s, '$.bank') IS NOT NULL
          AND JSON_EXTRACT(%s, '$.cash') IS NOT NULL
        ORDER BY total_money DESC 
        LIMIT %d
    ]], 
        config.identifierColumn,
        config.charinfoColumn,
        config.charinfoColumn,
        config.moneyColumn,
        config.moneyColumn,
        config.moneyColumn,
        config.moneyColumn,
        config.playersTable,
        config.identifierColumn,
        config.moneyColumn,
        config.moneyColumn,
        config.maxPlayers
    )

    local result = MySQL.Sync.fetchAll(query)
    
    if result then
        for i = 1, #result do
            local player = result[i]
            table.insert(players, {
                rank = i,
                identifier = player.identifier,
                name = (player.firstname or 'Unknown') .. ' ' .. (player.lastname or 'Player'),
                bank = tonumber(player.bank) or 0,
                cash = tonumber(player.cash) or 0,
                total = tonumber(player.total_money) or 0,
                lastUpdated = os.date('%Y-%m-%d %H:%M:%S')
            })
        end
    end

    return players
end

-- Function to send data to website
function SendElitePlayersToWebsite(playersData)
    if not playersData or #playersData == 0 then
        print('[MAYAAALOKAM] No elite players data to send')
        return
    end

    local payload = {
        players = playersData,
        serverInfo = {
            name = GetConvar('sv_hostname', 'MAYAAALOKAM Server'),
            maxPlayers = GetConvarInt('sv_maxclients', 64),
            timestamp = os.time()
        }
    }

    local jsonData = json.encode(payload)
    
    PerformHttpRequest(config.websiteURL .. '/api/fivem/elite-players', function(statusCode, response, headers)
        if statusCode == 200 then
            print('[MAYAAALOKAM] Elite players data synced successfully')
        else
            print('[MAYAAALOKAM] Failed to sync elite players data. Status: ' .. statusCode)
            if response then
                print('[MAYAAALOKAM] Response: ' .. response)
            end
        end
    end, 'POST', jsonData, {
        ['Content-Type'] = 'application/json',
        ['Authorization'] = 'Bearer ' .. config.apiKey,
        ['User-Agent'] = 'MAYAAALOKAM-FiveM-Server'
    })
end

-- Function to format money for display
function FormatMoney(amount)
    local formatted = tostring(amount)
    local k
    while true do
        formatted, k = string.gsub(formatted, "^(-?%d+)(%d%d%d)", '%1,%2')
        if (k == 0) then
            break
        end
    end
    return '$' .. formatted
end

-- Main sync function
function SyncElitePlayersData()
    if not isQBCore then
        return
    end

    print('[MAYAAALOKAM] Starting elite players sync...')
    
    local playersData = GetElitePlayersData()
    
    if playersData and #playersData > 0 then
        print('[MAYAAALOKAM] Found ' .. #playersData .. ' elite players')
        
        -- Debug output
        for i = 1, math.min(3, #playersData) do
            local player = playersData[i]
            print(string.format('[MAYAAALOKAM] #%d: %s - Total: %s', 
                player.rank, 
                player.name, 
                FormatMoney(player.total)
            ))
        end
        
        SendElitePlayersToWebsite(playersData)
    else
        print('[MAYAAALOKAM] No elite players data found')
    end
end

-- Start the sync timer
CreateThread(function()
    -- Wait for server to fully start
    Wait(30000) -- 30 seconds
    
    -- Initial sync
    SyncElitePlayersData()
    
    -- Regular sync every X minutes
    while true do
        Wait(config.syncInterval)
        SyncElitePlayersData()
    end
end)

-- Command to manually sync (admin only)
RegisterCommand('syncelite', function(source, args, rawCommand)
    if source == 0 then -- Server console
        SyncElitePlayersData()
    else
        -- Check if player is admin (using QBCore permissions)
        if QBCore.Functions.HasPermission(source, 'admin') then
            SyncElitePlayersData()
            TriggerClientEvent('QBCore:Notify', source, "Elite players sync triggered", "success", 5000)
        else
            TriggerClientEvent('QBCore:Notify', source, "You do not have permission for this command", "error", 5000)
        end
    end
end, true)

-- Server startup message
AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then
        return
    end
    
    print('========================================')
    print('MAYAAALOKAM Elite Players Sync Started')
    print('Website: ' .. config.websiteURL)
    print('Sync Interval: ' .. (config.syncInterval / 60000) .. ' minutes')
    print('Max Players: ' .. config.maxPlayers)
    print('========================================')
end)

-- Export functions for other resources
exports('GetElitePlayersData', GetElitePlayersData)
exports('SyncElitePlayersData', SyncElitePlayersData) 