require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

async function removeDutyPanels() {
  try {
    console.log('--- DUTY PANEL REMOVAL TOOL ---')
    console.log('BOT_TOKEN exists:', !!process.env.BOT_TOKEN)

    await client.login(process.env.BOT_TOKEN)
    console.log('✅ Bot logged in successfully')

    // Get channel ID from command line argument or environment
    const channelId = process.argv[2]
    
    if (!channelId) {
      console.error('❌ Please provide a channel ID as an argument')
      console.log('Usage: node backend/remove-duty-panel.js CHANNEL_ID')
      process.exit(1)
    }

    // Get the channel
    const channel = await client.channels.fetch(channelId)
    if (!channel) {
      console.error('❌ Channel not found')
      process.exit(1)
    }

    console.log(`📊 Scanning channel: ${channel.name} in server: ${channel.guild.name}`)
    
    // Fetch recent messages to find duty panels
    const messages = await channel.messages.fetch({ limit: 50 })
    let removedCount = 0

    for (const [messageId, message] of messages) {
      // Check if message is from the bot and contains duty log components
      if (message.author.id === client.user.id && 
          message.embeds.length > 0 && 
          message.embeds[0].title?.includes('DUTY LOG SYSTEM')) {
        
        try {
          await message.delete()
          console.log(`🗑️ Removed duty log panel (Message ID: ${messageId})`)
          removedCount++
        } catch (error) {
          console.error(`❌ Failed to remove message ${messageId}:`, error.message)
        }
      }
    }

    if (removedCount === 0) {
      console.log('ℹ️ No duty log panels found in this channel')
    } else {
      console.log(`✅ Successfully removed ${removedCount} duty log panel(s)`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    client.destroy()
  }
}

// Run the script
removeDutyPanels().then(() => {
  process.exit(0)
}).catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
}) 