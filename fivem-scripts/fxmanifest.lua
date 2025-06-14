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
    'qb-core', -- or 'es_extended' for ESX
    'mysql-async' -- or 'oxmysql'
} 