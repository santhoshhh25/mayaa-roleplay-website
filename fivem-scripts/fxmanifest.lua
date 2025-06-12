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