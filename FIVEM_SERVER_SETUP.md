# 🎮 FiveM Server Setup for Elite Players Data Sync

## For Server Admins - Setup Instructions

Since you don't have direct database access, your server admin needs to implement this script on the FiveM server.

### 📋 **What the Admin Needs to Do:**

## 1. Create Resource Folder

Create a new folder in your FiveM server's `resources` directory:
```
server/resources/[custom]/elite-players-sync/
```

## 2. Add Files to the Resource

### File: `fxmanifest.lua`
```lua
fx_version 'cerulean'
game 'gta5'

author 'MAYAAALOKAM Development Team'
description 'Elite Players Data Sync for Web Application'
version '1.0.0'

server_scripts {
    '@mysql-async/lib/MySQL.lua', -- or '@oxmysql/lib/MySQL.lua' if using oxmysql
    'elite_players_sync.lua'
}

dependencies {
    'es_extended', -- or 'qb-core' for QBCore
    'mysql-async' -- or 'oxmysql'
}
```

### File: `elite_players_sync.lua`
*(Content provided in the fivem-scripts folder)*

## 3. Configure the Script

### Update these variables in `elite_players_sync.lua`:

```lua
-- Change this to your actual web application URL
local WEB_APP_URL = "https://your-domain.com/api/sync-players"

-- Change this to a secure API key (must match your .env file)
local API_KEY = "mayaa-elite-players-2024-secure-key"

-- Adjust sync interval (in milliseconds)
local SYNC_INTERVAL = 300000 -- 5 minutes
```

### For QBCore Framework:
Replace the ESX code with:
```lua
function GetOfflinePlayersData()
    local players = {}
    
    MySQL.Async.fetchAll('SELECT citizenid, charinfo, money FROM players WHERE charinfo IS NOT NULL AND money IS NOT NULL ORDER BY (JSON_UNQUOTE(JSON_EXTRACT(money, "$.cash")) + JSON_UNQUOTE(JSON_EXTRACT(money, "$.bank"))) DESC LIMIT 20', {}, function(result)
        for _, row in ipairs(result) do
            local charinfo = json.decode(row.charinfo)
            local money = json.decode(row.money)
            
            local playerData = {
                identifier = row.citizenid,
                name = charinfo.firstname .. ' ' .. charinfo.lastname,
                cash = tonumber(money.cash) or 0,
                bank = tonumber(money.bank) or 0,
                totalWealth = (tonumber(money.cash) or 0) + (tonumber(money.bank) or 0),
                isOnline = false
            }
            
            table.insert(players, playerData)
        end
        
        SendDataToWebApp(players)
    end)
end
```

## 4. Add to server.cfg

Add this line to your `server.cfg`:
```
ensure elite-players-sync
```

## 5. Restart the Server

After adding the resource:
1. Restart your FiveM server
2. Check console for success messages:
   ```
   [Elite Players] Sync script started
   [Elite Players] Successfully synced X players to web app
   ```

## 6. Manual Testing

Server admins can test the sync manually with:
```
syncplayers
```
*(Run this command in the server console)*

---

## 🔧 **Web Application Configuration**

### Your .env file should have:
```env
FIVEM_SYNC_API_KEY=mayaa-elite-players-2024-secure-key
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Production URLs:
- Update `WEB_APP_URL` in the Lua script to your live domain
- For local testing, use: `http://your-local-ip:3000/api/sync-players`

---

## 📊 **How It Works:**

1. **FiveM Script** runs on your server every 5 minutes
2. **Queries Database** for top wealthy players
3. **Sends Data** via HTTP POST to your web application
4. **Web App** stores the data and displays it on the elite players page
5. **Real-time Updates** without direct database access

---

## 🚀 **Alternative Options (If Server Admin Can't Help):**

### Option 1: Discord Bot Integration
Ask admin to set up a Discord bot that posts player data to a private channel, then scrape that data.

### Option 2: File Export
Ask admin to export player data to a CSV/JSON file periodically and share via cloud storage.

### Option 3: Read-Only Database Access
Request admin to create a read-only MySQL user specifically for your web app.

### Option 4: Public API
Ask admin to create a simple API endpoint on the server that returns player data in JSON format.

---

## 📝 **Sample Admin Request Message:**

```
Hi [Admin Name],

Could you help set up a data sync script for our community website? 

I need to display our top wealthy players on the website. I've created a simple script that:
- Runs automatically every 5 minutes
- Sends player wealth data to our website
- Doesn't affect server performance
- Uses secure API authentication

Files and instructions: [Share this markdown file]

This will make our community website more engaging by showing real server data!

Thanks!
```

---

## ✅ **Testing Checklist:**

- [ ] Resource added to server
- [ ] Script starts without errors
- [ ] Manual sync command works
- [ ] Web app receives data
- [ ] Elite players page shows real data
- [ ] Data updates every 5 minutes

That's it! Once the admin implements this, your elite players page will show real data from your FiveM server! 🎉 