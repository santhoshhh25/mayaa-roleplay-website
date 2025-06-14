# 🏆 FiveM Elite Players Setup Guide

This guide helps you set up the **Elite Players Showcase** feature that displays the wealthiest players from your FiveM server on your website.

## 🎯 **What This Does:**

- **Syncs player data** from your FiveM server to your website
- **Shows top 10 wealthiest players** with their bank + cash totals
- **Updates automatically** every 5 minutes
- **Works with ESX framework** (QB-Core support can be added)

## 📋 **Prerequisites:**

- ✅ **ESX Framework** installed on your FiveM server
- ✅ **MySQL database** with player data
- ✅ **Admin access** to your FiveM server
- ✅ **Your website deployed** on Render

## 🛠️ **Step-by-Step Installation:**

### Step 1: Create the Resource Folder

1. **Navigate to your FiveM server resources folder:**
   ```
   /resources/[local]/mayaaalokam-elite-players/
   ```

2. **Create the folder structure:**
   ```
   mayaaalokam-elite-players/
   ├── fxmanifest.lua
   ├── server.lua
   └── config.lua
   ```

### Step 2: Create fxmanifest.lua

Create `fxmanifest.lua` with this content:

```lua
fx_version 'cerulean'
game 'gta5'

author 'MAYAAALOKAM Roleplay'
description 'Elite Players Data Sync for Website'
version '1.0.0'

server_scripts {
    '@mysql-async/lib/MySQL.lua',
    'config.lua',
    'server.lua'
}

dependencies {
    'es_extended',
    'mysql-async'
}
```

### Step 3: Create config.lua

Create `config.lua` with your configuration:

```lua
Config = {}

-- WEBSITE CONFIGURATION
Config.WebsiteURL = 'https://your-backend-url.onrender.com' -- YOUR RENDER BACKEND URL
Config.APIKey = 'your-secure-api-key-here' -- MUST MATCH YOUR .ENV FILE

-- SYNC SETTINGS
Config.SyncInterval = 300000 -- 5 minutes (300,000 milliseconds)
Config.MaxPlayers = 10 -- Top 10 players to display

-- DATABASE CONFIGURATION (Adjust for your ESX setup)
Config.DatabaseResource = 'es_extended' -- Your ESX resource name
Config.BankTable = 'users' -- Table containing player data
Config.BankColumn = 'bank' -- Column name for bank money
Config.CashColumn = 'money' -- Column name for cash money
Config.IdentifierColumn = 'identifier' -- Column name for player identifier
Config.FirstNameColumn = 'firstname' -- Column name for first name
Config.LastNameColumn = 'lastname' -- Column name for last name

-- ADMIN SETTINGS
Config.AdminGroups = {'admin', 'superadmin'} -- Groups that can use /syncelite command

-- DEBUG MODE
Config.Debug = true -- Set to false in production
```

### Step 4: Copy the Server Script

1. **Copy the content** from `fivem-scripts/elite_players_sync.lua`
2. **Paste it into** `server.lua` in your resource folder
3. **Update the configuration** at the top of the file with your actual values

### Step 5: Configure the Script

**Edit these values in `server.lua`:**

```lua
local config = {
    websiteURL = 'https://mayaaalokam-discord-bot-abc123.onrender.com', -- YOUR ACTUAL RENDER URL
    apiKey = 'your-super-secret-api-key-2024', -- MUST MATCH FIVEM_SYNC_API_KEY
    syncInterval = 300000, -- 5 minutes
    maxPlayers = 10, -- Top 10 players
    
    -- Adjust these based on your database structure
    databaseResource = 'es_extended',
    bankTable = 'users',
    bankColumn = 'bank',
    cashColumn = 'money',
    identifierColumn = 'identifier',
    nameColumn = 'firstname',
    lastnameColumn = 'lastname',
}
```

### Step 6: Add to server.cfg

Add this line to your `server.cfg`:

```
ensure mayaaalokam-elite-players
```

### Step 7: Set Environment Variables

**In your Render backend service, set:**

```
FIVEM_SYNC_API_KEY=your-super-secret-api-key-2024
```

**This MUST match the `apiKey` in your Lua script!**

## 🔧 **Configuration Options:**

### **Database Compatibility:**

**For Standard ESX:**
```lua
bankTable = 'users'
bankColumn = 'bank'
cashColumn = 'money'
```

**For Extended ESX:**
```lua
bankTable = 'users'
bankColumn = 'accounts' -- JSON column
cashColumn = 'accounts' -- JSON column
```

**For QB-Core (requires modification):**
```lua
bankTable = 'players'
bankColumn = 'money'
cashColumn = 'money'
```

### **Sync Frequency:**
```lua
syncInterval = 300000  -- 5 minutes
syncInterval = 600000  -- 10 minutes
syncInterval = 1800000 -- 30 minutes
```

## 🚀 **Starting the Resource:**

### **Restart your FiveM server** or use:
```
restart mayaaalokam-elite-players
```

### **Check console for startup messages:**
```
========================================
MAYAAALOKAM Elite Players Sync Started
Website: https://your-backend-url.onrender.com
Sync Interval: 5 minutes
Max Players: 10
========================================
[MAYAAALOKAM] ESX detected, elite players sync enabled
```

## 🎮 **Commands:**

### **Manual Sync (Console or Admin):**
```
syncelite
```

**Usage:**
- **Server Console:** Always works
- **In-game:** Only for admins (adjust admin check in script)

## 🔍 **Testing & Verification:**

### Step 1: Check Server Console
Look for these messages:
```
[MAYAAALOKAM] Starting elite players sync...
[MAYAAALOKAM] Found 10 elite players
[MAYAAALOKAM] #1: John Doe - Total: $1,234,567
[MAYAAALOKAM] Elite players data synced successfully
```

### Step 2: Check Website API
Visit: `https://your-backend-url.onrender.com/api/fivem/elite-players`

Should return JSON data like:
```json
{
  "success": true,
  "players": [
    {
      "rank": 1,
      "name": "John Doe",
      "bank": 1000000,
      "cash": 234567,
      "total": 1234567
    }
  ]
}
```

### Step 3: Check Website Display
Visit your website's elite players page to see the data displayed.

## 🚨 **Troubleshooting:**

### **Script Not Starting:**
- Check `fxmanifest.lua` syntax
- Ensure ESX is running before this resource
- Check server console for errors

### **No Data Syncing:**
- Verify `websiteURL` is correct
- Check `apiKey` matches environment variable
- Ensure players have money in database
- Check database table/column names

### **ESX Not Detected:**
```
[MAYAAALOKAM] Warning: ESX not detected
```
- Check `databaseResource` name
- Ensure ESX is started before this resource

### **Database Errors:**
- Verify table and column names match your database
- Check MySQL connection
- Ensure proper permissions

### **Website API Errors:**
- Check Render backend logs
- Verify environment variable `FIVEM_SYNC_API_KEY`
- Test API endpoint manually

## 🔐 **Security Notes:**

1. **Use a strong API key** (32+ characters)
2. **Keep API key secret** - don't share it
3. **Limit admin commands** to trusted players
4. **Monitor sync frequency** to avoid overloading

## 📊 **Performance Tips:**

1. **Adjust sync interval** based on server activity
2. **Limit max players** for better performance
3. **Use database indexes** on money columns
4. **Monitor server performance** after installation

---

**Your elite players showcase will now sync automatically every 5 minutes! 🏆** 