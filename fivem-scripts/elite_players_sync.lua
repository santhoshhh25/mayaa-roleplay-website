-- Elite Players Data Sync Script for FiveM Server
-- Place this in your FiveM server resources folder

local WEB_APP_URL = "http://your-domain.com/api/sync-players" -- Update with your web app URL
local SYNC_INTERVAL = 300000 -- 5 minutes in milliseconds
local API_KEY = "your-secure-api-key-here" -- Change this to a secure key

-- Function to get all player data
function GetElitePlayersData()
    local players = {}
    
    -- Get all online players
    for _, playerId in ipairs(GetPlayers()) do
        local xPlayer = ESX.GetPlayerFromId(playerId) -- For ESX framework
        -- For QBCore: local Player = QBCore.Functions.GetPlayer(playerId)
        
        if xPlayer then
            local playerData = {
                identifier = xPlayer.identifier,
                name = xPlayer.getName(),
                cash = xPlayer.getMoney(),
                bank = xPlayer.getAccount('bank').money,
                source = playerId
            }
            
            table.insert(players, playerData)
        end
    end
    
    return players
end

-- Function to get offline player data from database
function GetOfflinePlayersData()
    local players = {}
    
    -- Query database for top wealthy players
    MySQL.Async.fetchAll('SELECT identifier, firstname, lastname, money, bank FROM users WHERE money IS NOT NULL AND bank IS NOT NULL ORDER BY (money + bank) DESC LIMIT 20', {}, function(result)
        for _, row in ipairs(result) do
            local playerData = {
                identifier = row.identifier,
                name = row.firstname .. ' ' .. row.lastname,
                cash = tonumber(row.money) or 0,
                bank = tonumber(row.bank) or 0,
                totalWealth = (tonumber(row.money) or 0) + (tonumber(row.bank) or 0),
                isOnline = false
            }
            
            table.insert(players, playerData)
        end
        
        -- Send data to web application
        SendDataToWebApp(players)
    end)
end

-- Function to send data to web application
function SendDataToWebApp(playersData)
    local postData = json.encode({
        players = playersData,
        timestamp = os.time(),
        serverName = GetConvar("sv_hostname", "MAYAAALOKAM Server")
    })
    
    PerformHttpRequest(WEB_APP_URL, function(statusCode, response, headers)
        if statusCode == 200 then
            print("^2[Elite Players] Successfully synced " .. #playersData .. " players to web app^0")
        else
            print("^1[Elite Players] Failed to sync data. Status: " .. statusCode .. "^0")
        end
    end, 'POST', postData, {
        ['Content-Type'] = 'application/json',
        ['Authorization'] = 'Bearer ' .. API_KEY
    })
end

-- Auto-sync every 5 minutes
CreateThread(function()
    while true do
        Wait(SYNC_INTERVAL)
        GetOfflinePlayersData()
    end
end)

-- Manual sync command for admins
RegisterCommand('syncplayers', function(source, args, rawCommand)
    if source == 0 then -- Console only
        print("^3[Elite Players] Manual sync initiated...^0")
        GetOfflinePlayersData()
    end
end, true)

-- Sync when resource starts
AddEventHandler('onResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        Wait(5000) -- Wait for other resources to load
        print("^2[Elite Players] Sync script started^0")
        GetOfflinePlayersData()
    end
end) 