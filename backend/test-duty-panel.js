// Test script to post the duty log panel to a Discord channel
// Usage: node backend/test-duty-panel.js <channel_id>

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
require('dotenv').config()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

async function postDutyPanel(channelId) {
  try {
    console.log('--- ENV DEBUG ---');
    console.log('BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
    console.log('BOT_TOKEN length:', process.env.BOT_TOKEN ? process.env.BOT_TOKEN.length : 0);
    console.log('--- END ENV DEBUG ---');

    await client.login(process.env.BOT_TOKEN)
    
    console.log('Bot logged in successfully')
    
    // Get the channel
    const channel = await client.channels.fetch(channelId)
    if (!channel) {
      console.error('❌ Duty log panel channel not found')
      return false
    }

    // Create duty log panel embed
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setAuthor({ 
        name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
        iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
      })
      .setTitle('🕐 DUTY LOG SYSTEM')
      .setDescription(`
**Welcome to the Duty Log Management System**

Use the buttons below to manage your duty status:
• **Clock In** - Start your duty shift
• **Clock Out** - End your current shift

View your detailed duty statistics and history on the web dashboard.

**Available for:** PD, EMS, Mechanic, Merry weather personnel
      `)
      .addFields([
        { 
          name: '📋 Instructions', 
          value: `
1️⃣ Click **Clock In** to start your shift
2️⃣ Fill out the required character information
3️⃣ Click **Clock Out** when ending your shift
4️⃣ Visit the web dashboard for detailed statistics and history
          `.trim(),
          inline: false 
        }
      ])
      .setFooter({ 
        text: `MAYAAALOKAM RP • Duty Log System`, 
        iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
      })
      .setTimestamp()

    // Create action buttons
    const actionRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('duty_clockin')
          .setLabel('Clock In')
          .setStyle(ButtonStyle.Success)
          .setEmoji('🟢'),
        new ButtonBuilder()
          .setCustomId('duty_clockout')
          .setLabel('Clock Out')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔴')
      )

    await channel.send({
      embeds: [embed],
      components: [actionRow]
    })

    console.log('📋 Posted duty log panel')
    return true

  } catch (error) {
    console.error('❌ Error posting duty panel:', error.message)
    return false
  }
}

// Get channel ID from command line argument
const channelId = process.argv[2]

if (!channelId) {
  console.error('Usage: node backend/test-duty-panel.js <channel_id>')
  console.error('Example: node backend/test-duty-panel.js 1234567890123456789')
  process.exit(1)
}

console.log(`Posting duty log panel to channel: ${channelId}`)

postDutyPanel(channelId).then(success => {
  if (success) {
    console.log(`✅ Successfully posted duty log panel to channel ${channelId}`)
  } else {
    console.log(`❌ Failed to post duty log panel to channel ${channelId}`)
  }
  client.destroy()
  process.exit(success ? 0 : 1)
}) 