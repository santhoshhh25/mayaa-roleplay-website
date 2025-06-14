const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

async function postNewDutyPanel() {
  try {
    console.log('🤖 Connecting to Discord...');
    await client.login(process.env.BOT_TOKEN);
    
    console.log('✅ Bot connected successfully');
    
    // Get the duty logs channel
    const channelId = process.env.DUTY_LOGS_CHANNEL_ID;
    const channel = await client.channels.fetch(channelId);
    
    if (!channel) {
      console.error('❌ Duty log panel channel not found');
      return false;
    }

    // Create the new personalized duty log panel embed
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
• **Refresh Status** - Your personal duty information only
• **Edit Profile** - Update your character information

**Features:**
✅ Zero public messages in this channel
✅ Your status is private to you only
✅ Saved profiles - no re-entering data
✅ Professional embedded responses
✅ Promotion management system ready
      `)
      .addFields([
        { 
          name: '🎯 How It Works', 
          value: `
**First Time Users:** Click "Clock In" → Setup your profile once
**Existing Users:** Click "Clock In" → Instant access with saved data
**Everyone:** Your interactions are completely private!
          `.trim(),
          inline: false 
        },
        {
          name: '🏢 Departments Available',
          value: `
🚔 **Police Department** - 11 ranks (Cadet → Chief)
🚑 **Emergency Medical Services** - 8 ranks (EMT → Chief)  
🔧 **Mechanic** - 7 ranks (Apprentice → Manager)
🛡️ **Merry Weather** - 7 ranks (Recruit → Director)
          `.trim(),
          inline: false
        }
      ])
      .setFooter({ 
        text: `MAYAAALOKAM RP • Personal Duty System v2.0`, 
        iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
      })
      .setTimestamp();

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
      );

    await channel.send({
      embeds: [embed],
      components: [actionRow]
    });

    console.log('');
    console.log('🎉 NEW PERSONALIZED DUTY PANEL POSTED SUCCESSFULLY!');
    console.log('');
    console.log('🔥 NEW FEATURES ACTIVE:');
    console.log('✅ ZERO public messages in duty channel');
    console.log('✅ Each user sees their own personalized status');
    console.log('✅ Stored user profiles (no re-entering data)');
    console.log('✅ Quick clock in/out with saved data');
    console.log('✅ Professional embedded responses');
    console.log('✅ Edit profile functionality');
    console.log('✅ Promotion management system ready');
    console.log('');
    console.log('🎯 TEST IT NOW:');
    console.log('  • Have someone click "Clock In"');
    console.log('  • They will see ZERO public messages');
    console.log('  • Only private personalized responses');
    console.log('  • Saved data for future use');
    console.log('');
    console.log('🚀 The duty channel is now clean with personal experiences!');
    
    return true;

  } catch (error) {
    console.error('❌ Error posting duty panel:', error);
    return false;
  } finally {
    client.destroy();
    process.exit(0);
  }
}

postNewDutyPanel(); 