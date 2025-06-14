const { WhitelistBot } = require('./dist/discord-bot.js');

async function postNewDutyPanel() {
  try {
    console.log('🤖 Starting Discord bot...');
    const bot = new WhitelistBot();
    
    await bot.start();
    console.log('✅ Bot connected successfully');
    
    // Wait a moment for bot to be fully ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📋 Posting new personalized duty panel...');
    const success = await bot.postDutyLogPanel();
    
    if (success) {
      console.log('🎉 New personalized duty panel posted successfully!');
      console.log('');
      console.log('🔥 NEW FEATURES:');
      console.log('✅ ZERO public messages in duty channel');
      console.log('✅ Each user sees their own personalized status');
      console.log('✅ Stored user profiles (no re-entering data)');
      console.log('✅ Quick clock in/out with saved data');
      console.log('✅ Professional embedded responses');
      console.log('✅ Edit profile functionality');
      console.log('✅ Promotion management system ready');
      console.log('');
      console.log('🎯 Users can now:');
      console.log('  • Clock In - Uses saved profile or setup for first time');
      console.log('  • Clock Out - Instant with no public messages');
      console.log('  • Refresh Status - Shows personal duty info only');
      console.log('  • Edit Profile - Update character information');
    } else {
      console.log('❌ Failed to post duty panel');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error posting duty panel:', error);
    process.exit(1);
  }
}

postNewDutyPanel(); 