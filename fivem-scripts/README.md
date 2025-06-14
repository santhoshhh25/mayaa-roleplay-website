# MAYAAALOKAM Elite Players Sync Resource (QBCore)

This FiveM resource synchronizes the list of "elite" (wealthiest) players from your QBCore server to your web application's backend. It periodically fetches the top players based on their total money (bank + cash) and sends this data to a specified API endpoint.

## Features

-   Syncs top players to a web backend.
-   Configurable sync interval and number of players.
-   Built for QBCore-based servers.
-   Manual sync command for administrators.
-   Detailed configuration for database tables and columns.

## Installation

1.  **Create Resource Folder:** Create a new folder in your `resources` directory. For example, `[mayaa]-elite-sync`.
2.  **Add Files:** Place `elite_players_sync.lua` and `fxmanifest.lua` into this new folder.
3.  **Add to Server Config:** Add `ensure [mayaa]-elite-sync` to your `server.cfg` or `resources.cfg` file. Ensure it is started *after* `qb-core` and your database resource (`mysql-async` or `oxmysql`).

    ```cfg
    # Example server.cfg
    ensure qb-core
    ensure mysql-async
    ensure [mayaa]-elite-sync
    ```

## Dependencies

This resource requires:
-   **QBCore Framework:** `qb-core` is required.
-   **A Database Wrapper:** `mysql-async` or `oxmysql`. Make sure the `server_scripts` path in `fxmanifest.lua` matches the one you use.

    ```lua
    -- fxmanifest.lua
    server_scripts {
        '@mysql-async/lib/MySQL.lua', -- or '@oxmysql/lib/MySQL.lua' if using oxmysql
        'elite_players_sync.lua'
    }
    ```

## Configuration

Open `elite_players_sync.lua` and edit the `config` table at the top of the file.

```lua
local config = {
    -- REQUIRED CONFIGURATION
    websiteURL = 'https://your-backend-url.onrender.com', -- The URL of your backend API endpoint.
    apiKey = 'your-secure-api-key-here', -- The secret API key. This MUST match the FIVEM_SYNC_API_KEY in your backend's .env file.
    
    -- OPTIONAL CONFIGURATION
    syncInterval = 300000, -- How often to sync in milliseconds (default is 5 minutes).
    maxPlayers = 10, -- The number of top players to sync.
    
    -- QBCore DATABASE CONFIGURATION (MUST MATCH YOUR SERVER'S SETUP)
    databaseResource = 'qb-core', -- Your QBCore resource name.
    playersTable = 'players', -- The table containing player data.
    moneyColumn = 'money', -- The JSON column for money, e.g., '{"bank": 5000, "cash": 1000}'.
    charinfoColumn = 'charinfo', -- The JSON column for character info, e.g., '{"firstname": "John", "lastname": "Doe"}'.
    identifierColumn = 'citizenid', -- The column for the player's unique identifier.
}
```

### Configuration Details

-   `websiteURL`: This must point to the `/api/fivem/elite-players` endpoint of your deployed backend.
-   `apiKey`: This is a secret key to authenticate the request. It must be the same as the `FIVEM_SYNC_API_KEY` variable in your backend environment.
-   **Database Settings**: These values are set for a standard QBCore database. If you have customized your `players` table or the JSON structure within the `money` and `charinfo` columns, you will need to adjust the SQL query inside the `GetElitePlayersData` function in `elite_players_sync.lua`.

## Usage

The script will automatically start syncing data once the server is running. The first sync happens 30 seconds after the resource starts, and subsequent syncs occur based on the `syncInterval`.

### Manual Sync

Admins can trigger a manual sync at any time using the following command in the server console or in-game chat:

```
/syncelite
```
> **Note:** The in-game command requires the player to have the `admin` permission in QBCore. 