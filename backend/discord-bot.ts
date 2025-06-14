import { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle,
  ComponentType,
  PermissionFlagsBits,
  Colors,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder
} from 'discord.js'
import { DutyLogsAPI, DutyLogData, UserProfile, Department, Rank } from './duty-logs-api'


interface WhitelistApplication {
  fullName: string
  discordId: string
  age: string
  country: string
  timezone: string
  characterName: string
  characterAge: string
  characterBackground: string
  isNewToRP: string
  rpExperience?: string
  expectation: string
  rulesRead: string
  cfxLinked: string
  termsAccepted: boolean
  ageConfirmed: boolean
  submittedAt: Date
}

class WhitelistBot {
  private client: Client
  
  // Application server configuration
  private applicationGuildId: string
  private whitelistChannelId: string
  private responseChannelId: string
  private allowedRoleId: string
  private whitelistedRoleId: string
  private processedApplications = new Set<string>()
  
  // Duty logs server configuration
  private dutyLogsGuildId: string
  private dutyLogsChannelId: string
  private dutyLogsAuthorizedRoles: string[]

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    })

    // Application server configuration
    this.applicationGuildId = process.env.APPLICATION_GUILD_ID || process.env.GUILD_ID!
    this.whitelistChannelId = process.env.FORM_CHANNEL_ID!
    this.responseChannelId = process.env.RESPONSE_CHANNEL_ID!
    this.allowedRoleId = process.env.ALLOWED_ROLE_ID!
    this.whitelistedRoleId = process.env.WHITELISTED_ROLE_ID!
    
    // Duty logs server configuration
    this.dutyLogsGuildId = process.env.DUTY_LOGS_GUILD_ID || this.applicationGuildId
    this.dutyLogsChannelId = process.env.DUTY_LOGS_CHANNEL_ID!
    this.dutyLogsAuthorizedRoles = process.env.DUTY_LOGS_AUTHORIZED_ROLES?.split(',') || this.authorizedRoles

    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.client.once('ready', async () => {
      console.log(`✅ Discord bot logged in as ${this.client.user?.tag}`)
      console.log(`🏠 Applications server: ${this.applicationGuildId}`)
      console.log(`📋 Whitelist channel: ${this.whitelistChannelId}`)
      console.log(`📢 Response channel: ${this.responseChannelId}`)
      console.log(`🏢 Duty logs server: ${this.dutyLogsGuildId}`)
      console.log(`📊 Duty logs channel: ${this.dutyLogsChannelId}`)
      console.log(`👮 Authorized duty roles: ${this.dutyLogsAuthorizedRoles.length} roles`)
    })

    this.client.on('interactionCreate', async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId.startsWith('duty_')) {
          await this.handleDutyButtonInteraction(interaction)
        } else if (interaction.customId === 'quick_clockin') {
          await this.handleQuickClockIn(interaction)
        } else if (interaction.customId === 'quick_clockout') {
          await this.handleQuickClockOut(interaction)
        } else if (interaction.customId === 'edit_profile') {
          await this.handleEditProfile(interaction)
        } else if (interaction.customId === 'refresh_status') {
          await this.handlePersonalizedStatus(interaction)
        } else {
          await this.handleButtonInteraction(interaction)
        }
      } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('department_select_')) {
          await this.handleDepartmentSelectMenu(interaction)
        } else if (interaction.customId.startsWith('rank_select_')) {
          await this.handleRankSelectMenu(interaction)
        }
      } else if (interaction.isModalSubmit()) {
        // Legacy duty_final_modal disabled - all duty actions now use personalized panels
        // if (interaction.customId.startsWith('duty_final_modal')) {
        //   await this.handleDutyClockInModal(interaction)
        // } else 
        if (interaction.customId.startsWith('final_setup_')) {
          await this.showFinalSetupSubmit(interaction)

        } else {
          await this.handleModalSubmit(interaction)
        }
      }
    })

    this.client.on('error', (error) => {
      console.error('❌ Discord client error:', error)
    })
  }

  // Authorized role IDs for duty logs - users with these roles can use duty log buttons
  private readonly authorizedRoles = [
    '1380074287104266318',
	'1380106795896279080',
	'1380107141951787078',
	'1380106925097750639',
	'1382104576139858041', // Admin role as example
    // Add more role IDs here for PD, EMS, Mechanic, etc.
  ]

  // Department and rank mappings
  private readonly departments = {
    'SASP': ['🚔', 'SASP'],
    'Emergency Medical Services': ['🚑', 'EMS'], 
    'Bennys Garage': ['🔧', 'BENNYS'],
    'Merry Weather': ['🛡️', 'MW']
  }

  public async postDutyLogPanel(channelId?: string): Promise<boolean> {
    try {
      const targetChannelId = channelId || this.dutyLogsChannelId
      const channel = await this.client.channels.fetch(targetChannelId) as any
      if (!channel) {
        console.error('Duty log panel channel not found')
        return false
      }

      // Create duty log panel embed (instructions for first-time users only)
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
      const actionRow = new ActionRowBuilder<ButtonBuilder>()
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

      console.log('📋 Posted duty log panel')
      return true

    } catch (error) {
      console.error('Error posting duty log panel:', error)
      return false
    }
  }

    private async handleDutyButtonInteraction(interaction: any) {
    try {
      // Check if interaction is still valid (not expired)
      if (!interaction.isRepliable()) {
        console.error('❌ Duty interaction is no longer repliable (likely expired after 15 minutes)')
        return
      }

      // Check if interaction is from the duty logs server
      if (interaction.guildId !== this.dutyLogsGuildId) {
        await interaction.reply({
          content: '❌ Duty log features are only available in the designated duty logs server.',
          flags: 64 // MessageFlags.Ephemeral
        })
        return
      }

      // Check if user has authorized role
      if (!this.hasAuthorizedRole(interaction.member)) {
        await interaction.reply({
          content: '❌ You must have an authorized role to use duty log features.',
          flags: 64 // MessageFlags.Ephemeral
        })
        return
      }

      switch (interaction.customId) {
        case 'duty_clockin':
          await this.handleClockIn(interaction)
          break
        case 'duty_clockout':
          await this.handleClockOut(interaction)
          break
        case 'duty_status':
          await this.handlePersonalizedStatus(interaction)
          break
        default:
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: '❌ Unknown duty action.',
              flags: 64 // MessageFlags.Ephemeral
            })
          }
      }
    } catch (error) {
      console.error('❌ Duty button error:', error)
      
      // Only try to reply if we haven't already responded
      if (!interaction.replied && !interaction.deferred && interaction.isRepliable()) {
        try {
          await interaction.reply({
            content: '❌ An error occurred while processing your action.',
            flags: 64 // MessageFlags.Ephemeral
          })
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError)
        }
      }
    }
  }

  private hasAuthorizedRole(member: any): boolean {
    if (!member || !member.roles) return false
    
    return this.dutyLogsAuthorizedRoles.some(roleId => member.roles.cache.has(roleId)) || 
           member.permissions.has(PermissionFlagsBits.Administrator)
  }

  private async handleClockIn(interaction: any) {
    try {
      const { hasActiveSession } = await DutyLogsAPI.getActiveSession(interaction.user.id);
      if (hasActiveSession) {
        // Show personalized panel instead of error message
        await this.showPersonalizedPanel(interaction, true);
        return;
      }

      // Check for existing profile more thoroughly
      const { profile, isFirstTime } = await DutyLogsAPI.getUserProfile(interaction.user.id);
      
      // Double-check if profile actually exists to avoid duplicate key errors
      if (profile && profile.character_name && profile.department && profile.rank && profile.call_sign) {
        // User has a complete profile - clock in with stored data
        await this.quickClockIn(interaction, profile);
      } else {
        // Truly first time user or incomplete profile - show setup modal
        await this.showFirstTimeSetupModal(interaction);
      }
    } catch (error) {
      console.error('Clock in error:', error);
      if (!interaction.replied && !interaction.deferred) {
        await this.showPersonalizedPanel(interaction, false);
      }
    }
  }

  private async handleClockOut(interaction: any) {
    try {
      const result = await DutyLogsAPI.clockOut(interaction.user.id);
      
      // Always show personalized panel - no separate messages
      await this.showPersonalizedPanel(interaction, false);
      
    } catch (error) {
      console.error('Clock out error:', error);
      if (!interaction.replied && !interaction.deferred) {
        await this.showPersonalizedPanel(interaction, false);
      }
    }
  }

  private async handlePersonalizedStatus(interaction: any) {
    try {
      console.log(`🔍 handlePersonalizedStatus - deferred: ${interaction.deferred}, replied: ${interaction.replied}`);
      console.log(`🔍 Discord ID: ${interaction.user.id}, Username: ${interaction.user.username}`);
      
      // CRITICAL FIX: Always defer the interaction immediately to prevent timeouts
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }
      
      const { hasActiveSession, session } = await DutyLogsAPI.getActiveSession(interaction.user.id);
      console.log(`🔍 Active session found: ${hasActiveSession}`, session ? {
        character: session.character_name,
        department: session.department,
        status: session.status,
        clock_in: session.clock_in
      } : 'No session');
      
      await this.showPersonalizedPanel(interaction, hasActiveSession);
    } catch (error) {
      console.error('Status error:', error);
      
      // Enhanced error handling for interaction responses
      try {
        const errorMessage = '❌ Error loading your duty panel. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in handlePersonalizedStatus:', replyError);
      }
    }
  }

  private async showPersonalizedPanel(interaction: any, isOnDuty: boolean) {
    try {
      console.log(`🔍 showPersonalizedPanel - Discord ID: ${interaction.user.id}, isOnDuty param: ${isOnDuty}`);
      
      const { profile } = await DutyLogsAPI.getUserProfile(interaction.user.id);
      console.log(`🔍 User profile:`, profile ? {
        character: profile.character_name,
        department: profile.department,
        rank: profile.rank
      } : 'No profile');
      
      const { hasActiveSession, session } = await DutyLogsAPI.getActiveSession(interaction.user.id);
      console.log(`🔍 Active session check: ${hasActiveSession}`, session ? {
        character: session.character_name,
        status: session.status,
        clock_in: session.clock_in
      } : 'No active session');
      
      let embed;
      let components: ActionRowBuilder<ButtonBuilder>[] = [];

      if (hasActiveSession && session) {
        // ON DUTY Panel
        const clockInTime = new Date(session.clock_in);
        embed = new EmbedBuilder()
          .setColor(0x28A745) // Green
          .setTitle('🟢 Your Duty Status: ON DUTY')
          .addFields([
            { name: '👤 Character', value: session.character_name, inline: true },
            { name: '🏢 Department', value: session.department, inline: true },
            { name: '⭐ Rank', value: session.rank, inline: true },
            { name: '📻 Call Sign', value: session.call_sign || 'Not set', inline: true },
            { name: '⏰ Clocked In', value: `<t:${Math.floor(clockInTime.getTime() / 1000)}:R>`, inline: true },
            { name: '🆔 Discord', value: `${interaction.user.username}`, inline: true }
          ])
          .setFooter({ 
            text: `MAYAAALOKAM RP • Personal Duty Panel`, 
            iconURL: process.env.MAYAALOKAM_LOGO_URL 
          })
          .setTimestamp();

        if (session.notes) {
          embed.addFields([{ name: '📝 Notes', value: session.notes, inline: false }]);
        }

        // Clock Out button
        components.push(
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('quick_clockout')
                .setLabel('Clock Out')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔴'),
              new ButtonBuilder()
                .setCustomId('edit_profile')
                .setLabel('Edit Profile')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✏️'),
              new ButtonBuilder()
                .setCustomId('refresh_status')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄')
            )
        );
      } else {
        // OFF DUTY Panel
        embed = new EmbedBuilder()
          .setColor(0xDC3545) // Red
          .setTitle('🔴 Your Duty Status: OFF DUTY')
          .setDescription('You are currently off duty. Click "Clock In" to start your shift.')
          .addFields([
            { name: '🆔 Discord', value: `${interaction.user.username}`, inline: false }
          ])
          .setFooter({ 
            text: `MAYAAALOKAM RP • Personal Duty Panel`, 
            iconURL: process.env.MAYAALOKAM_LOGO_URL 
          })
          .setTimestamp();

        if (profile) {
          embed.addFields([
            { name: '👤 Character', value: profile.character_name, inline: true },
            { name: '🏢 Department', value: profile.department, inline: true },
            { name: '⭐ Rank', value: profile.rank, inline: true },
            { name: '📻 Call Sign', value: profile.call_sign, inline: true }
          ]);
        }

        // Clock In and Edit buttons
        components.push(
          new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('quick_clockin')
                .setLabel('Clock In')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🟢'),
              new ButtonBuilder()
                .setCustomId('edit_profile')
                .setLabel('Edit Profile')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('✏️'),
              new ButtonBuilder()
                .setCustomId('refresh_status')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔄')
            )
        );
      }

      // CRITICAL FIX: Proper interaction response handling
      // Always use editReply for deferred interactions, reply for non-deferred
      if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [embed], components, ephemeral: true });
      } else {
        // This should rarely happen, but handle it gracefully
        console.warn('⚠️ Interaction already replied, attempting followUp');
        await interaction.followUp({ embeds: [embed], components, ephemeral: true });
      }

    } catch (error) {
      console.error('Show personalized panel error:', error);
      
      // Enhanced error handling with proper interaction state checking
      try {
        const errorMessage = '❌ Error loading your duty panel. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          // This case should be rare
          await interaction.editReply({ content: errorMessage });
        } else {
          // Interaction already replied, use followUp
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  }

  private async showFirstTimeSetupModal(interaction: any) {
    try {
      // Show department selection dropdown instead of modal
      await this.showDepartmentSelection(interaction, 'first_time_setup');
    } catch (error) {
      console.error('Show first time setup modal error:', error);
    }
  }

  private async showDepartmentSelection(interaction: any, flow: 'first_time_setup' | 'edit_profile') {
    try {
      // CRITICAL FIX: Only defer if not already deferred
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }
      
      const departments = await DutyLogsAPI.getDepartments();
      
      if (!departments || departments.length === 0) {
        const errorMessage = '❌ No departments available. Please contact an administrator.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
        return;
      }

      const departmentSelect = new StringSelectMenuBuilder()
        .setCustomId(`department_select_${flow}`)
        .setPlaceholder('🏢 Select your department')
        .addOptions(
          departments.map(dept => ({
            label: dept.name,
            value: dept.name,
            description: `${dept.emoji} ${dept.abbreviation}`,
            emoji: dept.emoji
          }))
        );

      const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(departmentSelect);

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🏢 Department Selection')
        .setDescription('Please select your department from the dropdown below.')
        .setFooter({ 
          text: `MAYAAALOKAM RP • Setup Process`, 
          iconURL: process.env.MAYAALOKAM_LOGO_URL 
        })
        .setTimestamp();

      // CRITICAL FIX: Always use editReply for deferred interactions
      if (interaction.deferred && !interaction.replied) {
        await interaction.editReply({ embeds: [embed], components: [selectRow] });
      } else if (!interaction.replied) {
        await interaction.reply({ embeds: [embed], components: [selectRow], ephemeral: true });
      }

    } catch (error) {
      console.error('Show department selection error:', error);
      
      // Enhanced error handling
      try {
        const errorMessage = '❌ Error loading departments. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  }

  private async showRankSelection(interaction: any, department: string, flow: 'first_time_setup' | 'edit_profile') {
    try {
      const ranks = await DutyLogsAPI.getRanksByDepartment(department);
      
      if (!ranks || ranks.length === 0) {
        await interaction.editReply({
          content: `❌ No ranks found for ${department}. Please contact an administrator.`,
          components: []
        });
        return;
      }

      const rankSelect = new StringSelectMenuBuilder()
        .setCustomId(`rank_select_${flow}_${department}`)
        .setPlaceholder('⭐ Select your rank')
        .addOptions(
          ranks.map(rank => ({
            label: rank.name,
            value: rank.name,
            description: `Level ${rank.hierarchy_level}`
          }))
        );

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(flow === 'first_time_setup' ? '🎯 Setup Your Duty Profile' : '✏️ Edit Your Profile')
        .setDescription(`**Step 2 of 3:** Select your rank in **${department}**`)
        .setFooter({ 
          text: 'MAYAAALOKAM RP • Profile Setup', 
          iconURL: process.env.MAYAALOKAM_LOGO_URL 
        });

      const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(rankSelect);

      await interaction.editReply({ embeds: [embed], components: [row] });

    } catch (error) {
      console.error('Show rank selection error:', error);
      await interaction.editReply({
        content: '❌ Failed to load ranks. Please try again.',
        components: []
      });
    }
  }

  private async showFinalSetupSubmit(interaction: any) {
    try {
      // Parse the custom ID: final_setup_flow_department_rank
      // Example: final_setup_first_time_setup_SASP_Cadet
      const customId = interaction.customId;
      
      // Remove the "final_setup_" prefix
      const withoutPrefix = customId.replace('final_setup_', '');
      
      // Determine the flow type and extract the rest
      let flow: 'first_time_setup' | 'edit_profile';
      let remainingParts: string;
      
      if (withoutPrefix.startsWith('first_time_setup_')) {
        flow = 'first_time_setup';
        remainingParts = withoutPrefix.replace('first_time_setup_', '');
      } else if (withoutPrefix.startsWith('edit_profile_')) {
        flow = 'edit_profile';
        remainingParts = withoutPrefix.replace('edit_profile_', '');
      } else {
        throw new Error(`Unknown flow in custom ID: ${customId}`);
      }
      
      // Split the remaining parts and get department and rank
      const parts = remainingParts.split('_');
      const rank = parts[parts.length - 1]; // Last part is always the rank
      const department = parts.slice(0, -1).join('_'); // Everything except the last part is the department

      const profileData: UserProfile = {
        discord_id: interaction.user.id,
        username: `${interaction.user.username}#${interaction.user.discriminator}`,
        character_name: interaction.fields.getTextInputValue('character_name'),
        department: department,
        rank: rank,
        call_sign: interaction.fields.getTextInputValue('call_sign')
      };



      const result = await DutyLogsAPI.createOrUpdateUserProfile(profileData);
      
      if (result.success) {
        if (flow === 'first_time_setup') {
          // Clock in for new users
          await DutyLogsAPI.clockIn({
            discord_id: profileData.discord_id,
            username: profileData.username,
            character_name: profileData.character_name,
            department: profileData.department,
            rank: profileData.rank,
            call_sign: profileData.call_sign
          });
          
          const successEmbed = new EmbedBuilder()
            .setColor(0x28A745)
            .setTitle('🎉 Profile Setup Complete!')
            .setDescription('Your profile has been saved and you are now on duty!')
            .addFields([
              { name: '👤 Character', value: profileData.character_name, inline: true },
              { name: '🏢 Department', value: profileData.department, inline: true },
              { name: '⭐ Rank', value: profileData.rank, inline: true },
              { name: '📻 Call Sign', value: profileData.call_sign, inline: true },
              { name: '🆔 Discord', value: `${interaction.user.username}`, inline: true },
              { name: '⏰ Status', value: '🟢 ON DUTY', inline: true }
            ])
            .setFooter({ 
              text: `MAYAAALOKAM RP • Profile Setup Complete`, 
              iconURL: process.env.MAYAALOKAM_LOGO_URL 
            })
            .setTimestamp();

          await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
        } else {
          // Edit profile - just update
          const successEmbed = new EmbedBuilder()
            .setColor(0x28A745)
            .setTitle('✅ Profile Updated Successfully!')
            .addFields([
              { name: '👤 Character', value: profileData.character_name, inline: true },
              { name: '🏢 Department', value: profileData.department, inline: true },
              { name: '⭐ Rank', value: profileData.rank, inline: true },
              { name: '📻 Call Sign', value: profileData.call_sign, inline: true }
            ])
            .setFooter({ 
              text: `MAYAAALOKAM RP • Profile Updated`, 
              iconURL: process.env.MAYAALOKAM_LOGO_URL 
            })
            .setTimestamp();

          await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
        }
      } else {
        const errorMessage = '❌ Failed to save your profile. Please try again.';
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      }

    } catch (error) {
      console.error('Handle final setup submit error:', error);
      const errorMessage = '❌ An error occurred while saving your profile.';
      
      try {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  }

  private async quickClockIn(interaction: any, profile: UserProfile) {
    try {
      const dutyData = {
        discord_id: interaction.user.id,
        username: `${interaction.user.username}#${interaction.user.discriminator}`,
        character_name: profile.character_name,
        department: profile.department,
        rank: profile.rank,
        call_sign: profile.call_sign
      };

      const result = await DutyLogsAPI.clockIn(dutyData);
      
      if (result.success) {
        // Show updated personalized panel - no separate message
        await this.showPersonalizedPanel(interaction, true);
      } else {
        // Show error message and then the panel
        const errorMessage = `❌ Clock in failed: ${result.message}`;
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }

    } catch (error) {
      console.error('Quick clock in error:', error);
      
      // Enhanced error handling
      try {
        const errorMessage = '❌ Error during clock in. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in quickClockIn:', replyError);
      }
    }
  }

  private async handleDutyClockInModal(interaction: any) {
    try {
      // Check if interaction is from the duty logs server
      if (interaction.guildId !== this.dutyLogsGuildId) {
        await interaction.reply({
          content: '❌ Duty log features are only available in the designated duty logs server.',
          flags: MessageFlags.Ephemeral
        });
        return;
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const dutyData: DutyLogData = {
        discord_id: interaction.user.id,
        username: `${interaction.user.username}#${interaction.user.discriminator}`,
        character_name: interaction.fields.getTextInputValue('character_name'),
        department: interaction.customId.split('|')[1],
        rank: interaction.customId.split('|')[2],
        call_sign: interaction.fields.getTextInputValue('call_sign'),
        notes: interaction.fields.getTextInputValue('notes') || undefined
      };
      
      const result = await DutyLogsAPI.clockIn(dutyData);
      
      if (result.success) {
        // Create a detailed success embed
        const successEmbed = new EmbedBuilder()
          .setColor(0x28A745) // Green color for success
          .setTitle('🟢 Successfully Clocked In!')
          .addFields([
            { name: 'Character Name', value: dutyData.character_name, inline: true },
            { name: 'Department', value: dutyData.department, inline: true },
            { name: 'Rank', value: dutyData.rank, inline: true },
            { name: 'Call Sign', value: dutyData.call_sign, inline: true },
            { name: 'Discord User', value: dutyData.username, inline: true },
            { name: 'Clocked In', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
          ])
          .setFooter({ 
            text: `MAYAAALOKAM RP • Duty Log System`, 
            iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
          })
          .setTimestamp();
        
        if (dutyData.notes) {
          successEmbed.addFields([
            { name: 'Notes', value: dutyData.notes, inline: false }
          ]);
        }

        await interaction.editReply({ embeds: [successEmbed] });
      } else {
        // Create an error embed
        const errorEmbed = new EmbedBuilder()
          .setColor(0xDC3545) // Red color for error
          .setTitle('❌ Clock In Failed')
          .setDescription(result.message)
          .addFields([
            { name: 'Discord User', value: `${interaction.user.username}#${interaction.user.discriminator}`, inline: false }
          ])
          .setFooter({ 
            text: `MAYAAALOKAM RP • Duty Log System`, 
            iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
          })
          .setTimestamp();

        await interaction.editReply({ embeds: [errorEmbed] });
      }

    } catch (error) {
      console.error('❌ Duty clock in modal error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ An unexpected error occurred while processing your clock-in.' });
      }
    }
  }

  private async handleButtonInteraction(interaction: any) {
    try {
      // Check if interaction is still valid (not expired)
      if (!interaction.isRepliable()) {
        console.error('Interaction is no longer repliable (likely expired)')
        return
      }

      // Check permissions first
      if (!this.hasPermission(interaction.member)) {
        await interaction.reply({
          content: "❌ You don't have permission to take action on applications.",
          flags: MessageFlags.Ephemeral
        }).catch(() => {
          console.error('Failed to send permission error - interaction likely expired')
        })
        return
      }

      // Validate custom ID format
      const customIdParts = interaction.customId.split('_')
      if (customIdParts.length < 2) {
        await interaction.reply({
          content: "❌ Invalid interaction. Please refresh and try again.",
          flags: MessageFlags.Ephemeral
        })
        return
      }

      const [action, applicationId] = customIdParts
      
      // Prevent duplicate processing (TEMPORARILY DISABLED FOR TESTING)
      // if (this.processedApplications.has(applicationId)) {
      //   await interaction.reply({
      //     content: "⚠️ This application has already been processed.",
      //     ephemeral: true
      //   })
      //   return
      // }

      // Handle different actions
      if (action === 'accept') {
        await this.handleAcceptApplication(interaction, applicationId)
      } else if (action === 'decline') {
        await this.handleDeclineApplication(interaction, applicationId)
      } else {
        await interaction.reply({
          content: "❌ Unknown action. Please refresh and try again.",
          flags: MessageFlags.Ephemeral
        })
      }
    } catch (error) {
      console.error('Error handling button interaction:', error)
      
      // Only try to reply if the interaction hasn't been replied to and isn't expired
      if (!interaction.replied && !interaction.deferred && interaction.isRepliable()) {
        try {
          await interaction.reply({
            content: "❌ An unexpected error occurred. This might be an old application - please try submitting a new one.",
            flags: MessageFlags.Ephemeral
          })
        } catch (replyError) {
          console.error('Error sending error reply (interaction likely expired):', (replyError as Error).message)
        }
      }
    }
  }

  private async handleModalSubmit(interaction: any) {
    if (interaction.customId.startsWith('decline_modal_')) {
      const applicationId = interaction.customId.replace('decline_modal_', '')
      const reason = interaction.fields.getTextInputValue('decline_reason')
      
      await this.processDeclineApplication(interaction, applicationId, reason)
    } else if (interaction.customId === 'first_time_setup') {
      await this.handleFirstTimeSetup(interaction)
    }
  }

  private hasPermission(member: any): boolean {
    if (!member || !member.roles) return false
    
    return member.roles.cache.has(this.allowedRoleId) || 
           member.permissions.has(PermissionFlagsBits.Administrator)
  }

  private extractDiscordId(embed: any): string | null {

    // First try to find it in the Discord ID field
    const discordIdField = embed.fields.find((field: any) => field.name === '🆔 Discord ID')
    if (discordIdField) {
      return discordIdField.value.replace(/[<@>]/g, '')
    }

    // Fallback: try to extract from description
    const description = embed.description || ''
    const mentionMatch = description.match(/<@(\d+)>/)
    if (mentionMatch) {
      return mentionMatch[1]
    }

    // Last resort: check all fields for a Discord ID pattern
    for (const field of embed.fields) {
      const fieldMentionMatch = field.value.match(/<@(\d+)>/)
      if (fieldMentionMatch) {
        return fieldMentionMatch[1]
      }
    }

    return null
  }

  private async handleAcceptApplication(interaction: any, applicationId: string) {
    try {
      // Acknowledge the interaction silently
      await interaction.deferUpdate()

      // Extract user ID from embed
      const embed = interaction.message.embeds[0]
      const discordId = this.extractDiscordId(embed)
      
      if (!discordId) {
        await interaction.followUp({
          content: "❌ Could not find Discord ID in application. Please ensure the application contains a valid Discord ID.",
          flags: MessageFlags.Ephemeral
        })
        return
      }
      const guild = await this.client.guilds.fetch(this.applicationGuildId)
      const member = await guild.members.fetch(discordId).catch(() => null)

      if (!member) {
        await interaction.followUp({
          content: `❌ User <@${discordId}> is not in the server. They need to join first.`,
          flags: MessageFlags.Ephemeral
        })
        return
      }

      // Assign whitelist role
      await member.roles.add(this.whitelistedRoleId)

      // Mark as processed
      this.processedApplications.add(applicationId)

      // Update the original message
      await this.updateApplicationMessage(interaction.message, 'ACCEPTED', interaction.user)

      // Send professional response in response channel
      const responseChannel = await this.client.channels.fetch(this.responseChannelId) as any
      if (responseChannel) {
        const acceptEmbed = new EmbedBuilder()
          .setColor(0x28A745) // Professional green
          .setAuthor({ 
            name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
            iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
          })
          .setTitle('✅ Application Approved')
          .setDescription(`<@${discordId}>, your whitelist application has been approved.`)
          .addFields([
            { 
              name: 'Status', 
              value: `**Approved** • Reviewed by <@${interaction.user.id}> • <t:${Math.floor(Date.now() / 1000)}:R>`,
              inline: false 
            }
          ])
          .setFooter({ 
            text: 'MAYAAALOKAM RP', 
            iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
          })
          .setTimestamp()
          .setImage(this.getBoardingPassImageUrl('ACCEPTED'))

        await responseChannel.send({ 
          embeds: [acceptEmbed]
        })
      }

      // Send professional DM to user
      try {
        await member.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x28A745) // Professional green
              .setAuthor({ 
                name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
                iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
              })
              .setTitle('✅ Whitelist Application Approved')
              .setDescription('Congratulations! Your application has been approved and you are now whitelisted.')
              .addFields([
                { 
                  name: 'Next Steps', 
                  value: `• Connect to the server via FiveM\n• Review community guidelines\n• Introduce yourself and start playing`,
                  inline: false 
                }
              ])
              .setFooter({ 
                text: 'MAYAAALOKAM RP', 
                iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
              })
              .setTimestamp()
              .setImage(this.getBoardingPassImageUrl('ACCEPTED'))
          ]
        })
      } catch (error) {
        // console.log(`Could not DM user ${discordId}:`, error)
      }

      // Silently complete - no confirmation message to moderator
      // await interaction.editReply({
      //   content: `✅ Application accepted! <@${discordId}> has been given the whitelist role.`
      // })

    } catch (error) {
      console.error('Error accepting application:', error)
      try {
        await interaction.followUp({
          content: "❌ An error occurred while processing the application.",
          flags: MessageFlags.Ephemeral
        })
      } catch (replyError) {
        console.error('Error sending error reply:', replyError)
      }
    }
  }

  private async handleDeclineApplication(interaction: any, applicationId: string) {
    const modal = new ModalBuilder()
      .setCustomId(`decline_modal_${applicationId}`)
      .setTitle('Decline Application')

    const reasonInput = new TextInputBuilder()
      .setCustomId('decline_reason')
      .setLabel('Reason for declining')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Please provide a clear reason for declining this application...')
      .setMinLength(10)
      .setMaxLength(500)
      .setRequired(true)

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput)
    modal.addComponents(actionRow)

    await interaction.showModal(modal)
  }

  private async processDeclineApplication(interaction: any, applicationId: string, reason: string) {
    try {
      // Acknowledge the interaction silently
      await interaction.deferUpdate()

      // Extract user ID from embed
      const embed = interaction.message.embeds[0]
      const discordId = this.extractDiscordId(embed)
      
      if (!discordId) {
        await interaction.followUp({
          content: "❌ Could not find Discord ID in application. Please ensure the application contains a valid Discord ID.",
          flags: MessageFlags.Ephemeral
        })
        return
      }

      // Mark as processed
      this.processedApplications.add(applicationId)

      // Update the original message
      await this.updateApplicationMessage(interaction.message, 'DECLINED', interaction.user, reason)

      // Send professional response in response channel
      const responseChannel = await this.client.channels.fetch(this.responseChannelId) as any
      if (responseChannel) {
        const declineEmbed = new EmbedBuilder()
          .setColor(0xDC3545) // Professional red color
          .setAuthor({ 
            name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
            iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
          })
          .setTitle('❌ Application Requires Improvement')
          .setDescription(`<@${discordId}>, your application needs improvement before approval.`)
          .addFields([
            { 
              name: 'Status', 
              value: `**Requires Improvement** • Reviewed by <@${interaction.user.id}> • <t:${Math.floor(Date.now() / 1000)}:R>`,
              inline: false 
            },
            { 
              name: 'Feedback', 
              value: `\`\`\`${reason}\`\`\``,
              inline: false 
            }
          ])
          .setFooter({ 
            text: 'MAYAAALOKAM RP • You may reapply immediately', 
            iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
          })
          .setTimestamp()
          .setImage(this.getBoardingPassImageUrl('REJECTED'))

        await responseChannel.send({ 
          embeds: [declineEmbed]
        })
      }

      // Send professional DM to user
      try {
        const guild = await this.client.guilds.fetch(this.applicationGuildId)
        const member = await guild.members.fetch(discordId).catch(() => null)
        
        if (member) {
          await member.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xDC3545) // Professional red color
                .setAuthor({ 
                  name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
                  iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
                })
                .setTitle('❌ Application Feedback')
                .setDescription('Your application requires improvement before approval.')
                .addFields([
                  { 
                    name: 'Feedback', 
                    value: `\`\`\`${reason}\`\`\``,
                    inline: false 
                  },
                  { 
                    name: 'Next Steps', 
                    value: `• Review the feedback above\n• Address the mentioned issues\n• Submit a new application when ready`,
                    inline: false 
                  }
                ])
                .setFooter({ 
                  text: 'MAYAAALOKAM RP • You may reapply immediately', 
                  iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
                })
                .setTimestamp()
                .setImage(this.getBoardingPassImageUrl('REJECTED'))
            ]
          })
        }
      } catch (error) {
        // console.log(`Could not DM user ${discordId}:`, error)
      }

      // Silently complete - no confirmation message to moderator
      // await interaction.editReply({
      //   content: `❌ Application declined. User <@${discordId}> has been notified.`
      // })

    } catch (error) {
      console.error('Error declining application:', error)
      try {
        await interaction.followUp({
          content: "❌ An error occurred while processing the decline.",
          flags: MessageFlags.Ephemeral
        })
      } catch (replyError) {
        console.error('Error sending error reply:', replyError)
      }
    }
  }

  private async updateApplicationMessage(message: any, status: 'ACCEPTED' | 'DECLINED', moderator: any, reason?: string) {
    const originalEmbed = message.embeds[0]
    const updatedEmbed = new EmbedBuilder(originalEmbed.toJSON())

    if (status === 'ACCEPTED') {
      updatedEmbed.setColor(0x00FF00) // Bright green for accepted
      updatedEmbed.setTitle('✅ WHITELIST APPLICATION - APPROVED')
      updatedEmbed.addFields([
        { 
          name: '🎉 PROCESSING RESULTS', 
          value: `
**📊 Status:** \`APPROVED ✅\`
**👤 Processed by:** <@${moderator.id}>
**🕒 Processed at:** <t:${Math.floor(Date.now() / 1000)}:F>
**🎊 Welcome to MAYAAALOKAM!**
          `.trim(),
          inline: false 
        }
      ])
    } else {
      updatedEmbed.setColor(0xFF0000) // Bright red for declined
      updatedEmbed.setTitle('❌ WHITELIST APPLICATION - DECLINED')
      updatedEmbed.addFields([
        { 
          name: '📋 PROCESSING RESULTS', 
          value: `
**📊 Status:** \`DECLINED ❌\`
**👤 Processed by:** <@${moderator.id}>
**🕒 Processed at:** <t:${Math.floor(Date.now() / 1000)}:F>
          `.trim(),
          inline: false 
        }
      ])
      if (reason) {
        updatedEmbed.addFields([
          { 
            name: '📝 DECLINE REASON', 
            value: `\`\`\`${reason}\`\`\``,
            inline: false 
          }
        ])
      }
    }

    // Create disabled status buttons
    const disabledRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('accepted')
          .setLabel(status === 'ACCEPTED' ? 'APPLICATION APPROVED' : 'APPLICATION DECLINED')
          .setStyle(status === 'ACCEPTED' ? ButtonStyle.Success : ButtonStyle.Danger)
          .setEmoji(status === 'ACCEPTED' ? '✅' : '❌')
          .setDisabled(true)
      )

    await message.edit({
      embeds: [updatedEmbed],
      components: [disabledRow]
    })
  }

  private getBoardingPassImageUrl(status: 'ACCEPTED' | 'REJECTED'): string {
    if (status === 'ACCEPTED') {
      return 'https://i.ibb.co/pvdXxJMy/accepted.png'
    } else {
      return 'https://i.ibb.co/RGNQszNR/rejected.png'
    }
  }

  public async postWhitelistApplication(applicationData: WhitelistApplication): Promise<boolean> {
    try {
      const channel = await this.client.channels.fetch(this.whitelistChannelId) as any
      if (!channel) {
        console.error('Whitelist channel not found')
        return false
      }

      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create professional formatted embed with MAYAAALOKAM branding
      const embed = new EmbedBuilder()
        .setColor(0x2B2D31) // Discord dark theme color for professional look
        .setAuthor({ 
          name: 'MAYAAALOKAM ROLEPLAY COMMUNITY', 
          iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
        })
        .setTitle('🎯 NEW WHITELIST APPLICATION')
        .setDescription(`
**┌─────────────── APPLICATION OVERVIEW ───────────────┐**
**📊 Applicant:** <@${applicationData.discordId}>
**📅 Submitted:** <t:${Math.floor(applicationData.submittedAt.getTime() / 1000)}:F>
**🆔 Application ID:** \`${applicationId}\`
**└─────────────────────────────────────────────────────┘**
        `)
        .addFields([
          // Personal Information Section
          { 
            name: '👤 PERSONAL INFORMATION', 
            value: `
**🏷️ Full Name:** \`${applicationData.fullName}\`
**🎂 Age:** \`${applicationData.age} years old\`
**🌍 Country:** \`${applicationData.country}\`
**🕐 Timezone:** \`${applicationData.timezone}\`
**🆔 Discord:** <@${applicationData.discordId}>
            `.trim(),
            inline: false 
          },
          
          // Character Information Section
          { 
            name: '🎭 CHARACTER INFORMATION', 
            value: `
**👥 Character Name:** \`${applicationData.characterName}\`
**🎂 Character Age:** \`${applicationData.characterAge} years old\`
**🎮 New to Roleplay:** \`${applicationData.isNewToRP}\`
            `.trim(),
            inline: false 
          },
          
          // Character Background Section
          { 
            name: '📖 CHARACTER BACKGROUND STORY', 
            value: `\`\`\`${applicationData.characterBackground.length > 950 ? applicationData.characterBackground.substring(0, 947) + '...' : applicationData.characterBackground}\`\`\``,
            inline: false 
          }
        ])
        .setThumbnail(process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png')
        .setFooter({ 
          text: `MAYAAALOKAM RP • Application System v2.0`, 
          iconURL: process.env.MAYAALOKAM_LOGO_URL || 'http://localhost:3000/images/mayaalokam-logo.png'
        })
        .setTimestamp(applicationData.submittedAt)

      // Add RP Experience Section if provided
      if (applicationData.rpExperience) {
        embed.addFields([
          { 
            name: '🎮 ROLEPLAY EXPERIENCE', 
            value: `\`\`\`${applicationData.rpExperience.length > 950 ? applicationData.rpExperience.substring(0, 947) + '...' : applicationData.rpExperience}\`\`\``,
            inline: false 
          }
        ])
      }

      // Add Expectations and Status Section
      embed.addFields([
        { 
          name: '💭 SERVER EXPECTATIONS', 
          value: `\`\`\`${applicationData.expectation.length > 950 ? applicationData.expectation.substring(0, 947) + '...' : applicationData.expectation}\`\`\``,
          inline: false 
        },
        { 
          name: '✅ COMPLIANCE STATUS', 
          value: `
**📋 Rules Read:** \`${applicationData.rulesRead}\`
**🔗 CFX Account:** \`${applicationData.cfxLinked}\`
**📝 Terms Accepted:** \`${applicationData.termsAccepted ? 'Yes' : 'No'}\`
**🎂 Age Confirmed:** \`${applicationData.ageConfirmed ? 'Yes' : 'No'}\`
          `.trim(),
          inline: false 
        }
      ])

      // Create professional action buttons
      const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`accept_${applicationId}`)
            .setLabel('APPROVE APPLICATION')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId(`decline_${applicationId}`)
            .setLabel('DECLINE APPLICATION')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
        )

      await channel.send({
        embeds: [embed],
        components: [actionRow]
      })

      // console.log(`📋 Posted whitelist application for ${applicationData.fullName} (${applicationData.discordId})`)
      return true

    } catch (error) {
      console.error('Error posting whitelist application:', error)
      return false
    }
  }

  public async start() {
    try {
      await this.client.login(process.env.BOT_TOKEN)
    } catch (error) {
      console.error('Failed to start Discord bot:', error)
      throw error
    }
  }

  public getClient() {
    return this.client
  }

  // Method to clear processed applications (useful for testing)
  public clearProcessedApplications() {
    this.processedApplications.clear()
    console.log('🧹 Cleared processed applications cache')
  }

  private async handleFirstTimeSetup(interaction: any) {
    try {
      // Modal interactions are auto-deferred by Discord.js but NOT ephemeral
      // We need to handle this immediately with a reply instead of editReply
      // since we can't change the ephemeral state of an already deferred interaction

      const profileData: UserProfile = {
        discord_id: interaction.user.id,
        username: `${interaction.user.username}#${interaction.user.discriminator}`,
        character_name: interaction.fields.getTextInputValue('character_name'),
        department: interaction.fields.getTextInputValue('department'),
        rank: interaction.fields.getTextInputValue('rank'),
        call_sign: interaction.fields.getTextInputValue('call_sign')
      };

      const result = await DutyLogsAPI.createOrUpdateUserProfile(profileData);
      
      if (result.success) {
        // Clock in with new/updated profile
        await DutyLogsAPI.clockIn({
          discord_id: profileData.discord_id,
          username: profileData.username,
          character_name: profileData.character_name,
          department: profileData.department,
          rank: profileData.rank,
          call_sign: profileData.call_sign
        });
        
        // Create success embed instead of calling showPersonalizedPanel
        const successEmbed = new EmbedBuilder()
          .setColor(0x28A745)
          .setTitle('🎉 Profile Setup Complete!')
          .setDescription('Your profile has been saved and you are now on duty!')
          .addFields([
            { name: '👤 Character', value: profileData.character_name, inline: true },
            { name: '🏢 Department', value: profileData.department, inline: true },
            { name: '⭐ Rank', value: profileData.rank, inline: true },
            { name: '📻 Call Sign', value: profileData.call_sign, inline: true },
            { name: '🆔 Discord', value: `${interaction.user.username}`, inline: true },
            { name: '⏰ Status', value: '🟢 ON DUTY', inline: true }
          ])
          .setFooter({ 
            text: `MAYAAALOKAM RP • Profile Setup Complete`, 
            iconURL: process.env.MAYAALOKAM_LOGO_URL 
          })
          .setTimestamp();

        // Use reply with ephemeral flag since modal interactions aren't ephemeral by default
        await interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
      } else {
        const errorMessage = '❌ Failed to save your profile. Please try again.';
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      }

    } catch (error) {
      console.error('Handle first time setup error:', error);
      const errorMessage = '❌ An error occurred while setting up your profile.';
      
      try {
        await interaction.reply({ content: errorMessage, flags: MessageFlags.Ephemeral });
      } catch (replyError) {
        console.error('Failed to send error reply:', replyError);
      }
    }
  }

  private async handleQuickClockIn(interaction: any) {
    try {
      console.log(`🔍 handleQuickClockIn - deferred: ${interaction.deferred}, replied: ${interaction.replied}`);
      
      // CRITICAL FIX: Always defer the interaction immediately to prevent timeouts
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }
      
      const { profile, isFirstTime } = await DutyLogsAPI.getUserProfile(interaction.user.id);
      
      if (isFirstTime || !profile) {
        // First time user - show setup flow
        await this.showFirstTimeSetupModal(interaction);
      } else {
        // Existing user - quick clock in
        await this.quickClockIn(interaction, profile);
      }
    } catch (error) {
      console.error('Quick clock in error:', error);
      
      // Enhanced error handling
      try {
        const errorMessage = '❌ Error processing clock in. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in handleQuickClockIn:', replyError);
      }
    }
  }

  private async handleQuickClockOut(interaction: any) {
    try {
      console.log(`🔍 handleQuickClockOut - deferred: ${interaction.deferred}, replied: ${interaction.replied}`);
      
      // CRITICAL FIX: Always defer the interaction immediately to prevent timeouts
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }
      
      const result = await DutyLogsAPI.clockOut(interaction.user.id);
      
      if (result.success) {
        await this.showPersonalizedPanel(interaction, false);
      } else {
        // Show error message
        const errorMessage = `❌ Clock out failed: ${result.message}`;
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      }
    } catch (error) {
      console.error('Handle quick clock out error:', error);
      
      // Enhanced error handling
      try {
        const errorMessage = '❌ Error during clock out. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in handleQuickClockOut:', replyError);
      }
    }
  }

  private async handleEditProfile(interaction: any) {
    try {
      // CRITICAL FIX: Always defer the interaction immediately to prevent timeouts
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }
      
      await this.showDepartmentSelection(interaction, 'edit_profile');
    } catch (error) {
      console.error('Handle edit profile error:', error);
      
      // Enhanced error handling
      try {
        const errorMessage = '❌ An error occurred while loading the edit form. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          await interaction.editReply({ content: errorMessage });
        } else {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in handleEditProfile:', replyError);
      }
    }
  }

  private async handleDepartmentSelectMenu(interaction: any) {
    try {
      // CRITICAL FIX: Always defer the interaction immediately to prevent timeouts
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true });
      }
      
      const selectedDepartment = interaction.values[0];
      const flow = interaction.customId.includes('first_time_setup') ? 'first_time_setup' : 'edit_profile';
      
      await this.showRankSelection(interaction, selectedDepartment, flow);
    } catch (error) {
      console.error('Handle department select menu error:', error);
      
      // Enhanced error handling
      try {
        const errorMessage = '❌ An error occurred. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage, components: [] });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          await interaction.editReply({ content: errorMessage, components: [] });
        } else {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in handleDepartmentSelectMenu:', replyError);
      }
    }
  }

  private async handleRankSelectMenu(interaction: any) {
    try {
      // CRITICAL FIX: Do NOT defer when showing a modal - modals must be immediate responses
      const selectedRank = interaction.values[0];
      const customId = interaction.customId;
      
      // Parse the custom ID: rank_select_flow_department
      // Example: rank_select_first_time_setup_SASP
      const withoutPrefix = customId.replace('rank_select_', '');
      
      // Determine the flow type and extract the department
      let flow: 'first_time_setup' | 'edit_profile';
      let department: string;
      
      if (withoutPrefix.startsWith('first_time_setup_')) {
        flow = 'first_time_setup';
        department = withoutPrefix.replace('first_time_setup_', '');
      } else if (withoutPrefix.startsWith('edit_profile_')) {
        flow = 'edit_profile';
        department = withoutPrefix.replace('edit_profile_', '');
      } else {
        throw new Error(`Unknown flow in rank select custom ID: ${customId}`);
      }
      
      await this.handleFinalSetupModal(interaction, department, selectedRank, flow);
    } catch (error) {
      console.error('Handle rank select menu error:', error);
      
      // Enhanced error handling - use reply since we haven't deferred
      try {
        const errorMessage = '❌ An error occurred. Please try again.';
        
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({ content: errorMessage, components: [] });
        } else {
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in handleRankSelectMenu:', replyError);
      }
    }
  }

  private async handleFinalSetupModal(interaction: any, department: string, rank: string, flow: 'first_time_setup' | 'edit_profile') {
    try {
      const existingProfile = flow === 'edit_profile' ? 
        (await DutyLogsAPI.getUserProfile(interaction.user.id)).profile : null;

      const modal = new ModalBuilder()
        .setCustomId(`final_setup_${flow}_${department}_${rank}`)
        .setTitle('🎯 Complete Your Profile');

      const characterNameInput = new TextInputBuilder()
        .setCustomId('character_name')
        .setLabel('Character Name')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter your character name')
        .setValue(existingProfile?.character_name || '')
        .setRequired(true);

      const callSignInput = new TextInputBuilder()
        .setCustomId('call_sign')
        .setLabel('Call Sign')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter your call sign (e.g., 101, A-1)')
        .setValue(existingProfile?.call_sign || '')
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(characterNameInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(callSignInput)
      );

      await interaction.showModal(modal);

    } catch (error) {
      console.error('Show final setup modal error:', error);
      
      // Enhanced error handling for both deferred and non-deferred interactions
      try {
        const errorMessage = '❌ An error occurred. Please try again.';
        
        if (interaction.deferred && !interaction.replied) {
          // Interaction was deferred (from edit profile flow)
          await interaction.editReply({ content: errorMessage, components: [] });
        } else if (!interaction.replied && !interaction.deferred) {
          // Interaction was not deferred (from rank selection flow)
          await interaction.reply({ content: errorMessage, ephemeral: true });
        } else if (!interaction.replied) {
          // Fallback case
          await interaction.editReply({ content: errorMessage, components: [] });
        } else {
          // Already replied, use followUp
          await interaction.followUp({ content: errorMessage, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Failed to send error reply in showFinalSetupModal:', replyError);
      }
    }
  }
}

export default WhitelistBot
export type { WhitelistApplication }