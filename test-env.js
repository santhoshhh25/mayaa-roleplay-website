require('dotenv').config()

console.log('Environment test:')
console.log('BOT_TOKEN exists:', !!process.env.BOT_TOKEN)
console.log('BOT_TOKEN length:', process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0)
console.log('BOT_TOKEN starts with:', process.env.BOT_TOKEN ? process.env.BOT_TOKEN.substring(0, 10) + '...' : 'undefined')
console.log('NODE_ENV:', process.env.NODE_ENV)

// Check if .env file exists
const fs = require('fs')
console.log('.env file exists:', fs.existsSync('.env')) 