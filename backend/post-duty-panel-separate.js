import dotenv from 'dotenv'
import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

dotenv.config()

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
      .setTitle('🕐 PERSONAL DUTY LOG SYSTEM')
      .setDescription(`
**Welcome to the Duty Log System!**

• **First time here?** Click **Clock In** to set up your profile and start your first shift.
• **Returning?** Click **My Status** to view your private duty panel.
• **All actions are private**—no public confirmations or status messages will appear here.
      `)
      .addFields([
        { 
          name: 'How It Works', 
          value: `
1️⃣ **First Time:** Click **Clock In** and fill out your profile. You'll only do this once.
2️⃣ **After Setup:** Use **Clock In/Out** and **My Status** to manage your duty privately.
3️⃣ **Edit Profile:** Update your info anytime with the Edit button in your private panel.
          `.trim(),
          inline: false 
        },
        {
          name: 'Privacy Notice',
          value: '✅ All your duty actions and status are private. Only you can see your details.',
          inline: false
        }
      ])
      .setFooter({ 
        text: `MAYAAALOKAM RP • Personal Duty System`, 
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
          .setLabel('My Status')
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