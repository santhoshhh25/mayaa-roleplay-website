// Test script to post the NEW PERSONALIZED duty log panel to a Discord channel
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

    // Create NEW PERSONALIZED duty log panel embed
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setAuthor({ 
        name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
        iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
      })
      .setTitle('🕐 PERSONAL DUTY LOG SYSTEM')
      .setDescription(`
**🔥 NEW: Personalized Duty Experience!**

Each user now gets their own private duty status - no more shared messages!

• **Clock In** - Quick access with saved profile data
• **Clock Out** - Instant with zero public messages  
• **My Status** - Your personal duty information only

**Revolutionary Features:**
✅ **ZERO public messages** in this channel
✅ **Your status is private** to you only  
✅ **Saved profiles** - no re-entering data
✅ **Quick clock in/out** with stored information
✅ **Professional responses** with rich embeds
✅ **Edit profile** functionality anytime
✅ **Promotion management** system ready
      `)
      .addFields([
        { 
          name: '🎯 How It Works', 
          value: `
**First Time Users:** Click "Clock In" → Setup your profile once and done!
**Existing Users:** Click "Clock In" → Instant access with your saved data
**Everyone:** All your interactions are completely private!
          `.trim(),
          inline: false 
        },
        {
          name: '🏢 Departments & Ranks Available',
          value: `
🚔 **Police Department** - 11 ranks (Cadet → Chief of Police)
🚑 **Emergency Medical Services** - 8 ranks (EMT Basic → EMS Chief)  
🔧 **Mechanic** - 7 ranks (Apprentice → Service Manager)
🛡️ **Merry Weather** - 7 ranks (Recruit → Regional Director)
          `.trim(),
          inline: false
        },
        {
          name: '⚡ What Changed',
          value: `
🚫 **NO MORE** public "You are now on duty" messages
🔒 **PRIVATE** status responses only you see
💾 **SAVED** character data for instant access
🎨 **BEAUTIFUL** embedded status panels
👤 **PERSONAL** duty experience for each user
          `.trim(),
          inline: false
        }
      ])
      .setFooter({ 
        text: `MAYAAALOKAM RP • Personal Duty System v2.0 - Zero Public Messages!`, 
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
          .setEmoji('👤')
      )

    await channel.send({
      embeds: [embed],
      components: [actionRow]
    })

    console.log('')
    console.log('🎉 NEW PERSONALIZED DUTY PANEL POSTED SUCCESSFULLY!')
    console.log('')
    console.log('🔥 REVOLUTIONARY FEATURES NOW ACTIVE:')
    console.log('✅ ZERO public messages in duty channel')
    console.log('✅ Each user sees their own personalized status')
    console.log('✅ Stored user profiles (no re-entering data)')
    console.log('✅ Quick clock in/out with saved data')
    console.log('✅ Professional embedded responses')
    console.log('✅ Edit profile functionality')
    console.log('✅ Promotion management system ready')
    console.log('')
    console.log('🎯 TEST IT NOW:')
    console.log('  • Have someone click "Clock In"')
    console.log('  • They will see ZERO public messages')
    console.log('  • Only private personalized responses')
    console.log('  • Data saved for future instant access')
    console.log('')
    console.log('🚀 The duty channel is now 100% clean with personal experiences!')
    
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