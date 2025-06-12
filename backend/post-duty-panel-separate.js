require('dotenv').config()
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

async function postDutyPanelToSeparateServer() {
  try {
    console.log('--- DUTY LOGS SERVER SETUP ---');
    console.log('BOT_TOKEN exists:', !!process.env.BOT_TOKEN);
    console.log('DUTY_LOGS_GUILD_ID:', process.env.DUTY_LOGS_GUILD_ID);
    console.log('DUTY_LOGS_CHANNEL_ID:', process.env.DUTY_LOGS_CHANNEL_ID);

    await client.login(process.env.BOT_TOKEN)
    
    console.log('✅ Bot logged in successfully')
    
    // Use duty logs channel ID from environment, fallback to parameter if needed
    const channelId = process.env.DUTY_LOGS_CHANNEL_ID || process.argv[2]
    
    if (!channelId) {
      console.error('❌ No channel ID provided. Set DUTY_LOGS_CHANNEL_ID in .env or provide as argument')
      process.exit(1)
    }

    // Get the channel
    const channel = await client.channels.fetch(channelId)
    if (!channel) {
      console.error('❌ Duty log panel channel not found')
      return false
    }

    console.log(`📊 Posting to channel: ${channel.name} in server: ${channel.guild.name}`)

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
• **Clock In** - Start your duty shift with character details
• **Clock Out** - End your current shift
• **Refresh Status** - Update your current duty status

View your detailed duty statistics and history on the web dashboard.

**Available for:** PD, EMS, Mechanic, Merry weather personnel
      `)
      .addFields([
        { 
          name: '📋 Instructions', 
          value: `
1️⃣ Click **Clock In** to start your shift
2️⃣ Select your department and rank
3️⃣ Fill out the required character information
4️⃣ Click **Clock Out** when ending your shift
5️⃣ Use **Refresh Status** to see your current status
6️⃣ Visit the web dashboard for detailed statistics and history
          `.trim(),
          inline: false 
        },
        {
          name: '🌐 Web Dashboard',
          value: `Access your detailed duty logs and statistics at: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/duty-logs`,
          inline: false
        }
      ])
      .setFooter({ 
        text: `MAYAAALOKAM RP • Duty Log System v2.0`, 
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
          .setEmoji('🔴'),
        new ButtonBuilder()
          .setCustomId('duty_status')
          .setLabel('Refresh Status')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔄')
      )

    await channel.send({
      embeds: [embed],
      components: [actionRow]
    })

    console.log('✅ Duty log panel posted successfully to separate server!')
    console.log(`🏢 Server: ${channel.guild.name}`)
    console.log(`📊 Channel: ${channel.name}`)
    
    return true

  } catch (error) {
    console.error('❌ Error posting duty panel:', error)
    return false
  } finally {
    client.destroy()
  }
}

// Run the script
postDutyPanelToSeparateServer().then(() => {
  process.exit(0)
}).catch(error => {
  console.error('Script failed:', error)
  process.exit(1)
}) 