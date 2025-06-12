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
import { DutyLogsAPI, DutyLogData } from './duty-logs-api'


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
        } else {
          await this.handleButtonInteraction(interaction)
        }
      } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('duty_department_select')) {
          await this.handleDepartmentSelection(interaction)
        } else if (interaction.customId.startsWith('duty_rank_select_')) {
          await this.handleRankSelection(interaction)
        }
      } else if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('duty_final_modal|')) {
          await this.handleDutyClockInModal(interaction)
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
    'PD': [
      'Cadet', 'Solo Cadet', 'Officer', 'Officer 1C', 'Senior Officer', 
      'Corporal', 'Corporal 1C', 'Sergeant', 'Head-Sergeant', 'Lieutenant', 
      'ACP', 'Captain', 'Commander', 'Deputy Chief', 'Asst. Chief', 
      'LSPD Chief', 'Trooper', 'SASP Chief', 'Detective'
    ],
    'Merry weather': [
      'Recruit', 'Corporal', 'Sergeant', 'Lieutenant', 'Chief'
    ],
    'EMS': [
      'EMT', 'EMT Advance', 'Doctor', 'Senior Doctor', 'Surgeon', 
      'Medical Advisor', 'Assistant Director', 'Deputy Director', 'Chief Director'
    ],
    'Mechanic': [
      'Apprentice Mechanic', 'Junior Mechanic', 'Mechanic', 'Skilled Mechanic', 
      'Senior Mechanic', 'Lead Mechanic', 'Master Mechanic', 'Garage Supervisor', 
      'Workshop Manager', 'Chief Engineer', 'Operations Captain', 'Mechanic Commander', 
      'Deputy Director', 'Assistant Director', 'Head of Mechanics', 'Elite Mechanic', 
      'Grandmaster Technician'
    ]
  }

  public async postDutyLogPanel(channelId?: string): Promise<boolean> {
    try {
      const targetChannelId = channelId || this.dutyLogsChannelId
      const channel = await this.client.channels.fetch(targetChannelId) as any
      if (!channel) {
        console.error('Duty log panel channel not found')
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
Use the buttons below to manage your duty status. Your current status will be reflected on this panel after you interact with it.
        `)
        .addFields([
          { name: 'Your Status', value: '⚫ Unknown (Click Refresh Status)', inline: false },
          { 
            name: '📋 Instructions', 
            value: `
1️⃣ Click **Clock In** or **Clock Out**.
2️⃣ Use **Refresh Status** to update this panel with your current duty status.
3️⃣ View detailed history on the web dashboard.
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
            .setLabel('Refresh Status')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔄')
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
          await this.showClockInModal(interaction)
          break
        case 'duty_clockout':
          await this.handleClockOutButton(interaction)
          break
        case 'duty_status':
          await this.handleDutyStatusButton(interaction)
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

  private async showClockInModal(interaction: any) {
    try {
      const { hasActiveSession } = await DutyLogsAPI.getActiveSession(interaction.user.id);
      if (hasActiveSession) {
        await interaction.reply({
          content: '❌ You are already on duty. Please clock out before starting a new session.',
          flags: 64 // MessageFlags.Ephemeral
        });
        return;
      }

      // Check if interaction is still valid before proceeding
      if (!interaction.isRepliable()) {
        console.error('❌ Clock in interaction expired before showing modal')
        return
      }

      // Step 1: Show department selection dropdown
      await this.showDepartmentSelection(interaction)
    } catch (error) {
      console.error('Show clock in modal error:', error)
      // Only reply if we haven't responded and the interaction is still valid
      if (!interaction.replied && !interaction.deferred && interaction.isRepliable()) {
        try {
          await interaction.reply({
            content: '❌ An error occurred while opening the clock in form. The interaction may have expired.',
            flags: 64 // MessageFlags.Ephemeral
          })
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError)
        }
      }
    }
  }

  private async showDepartmentSelection(interaction: any) {
    try {
      const departmentOptions = Object.keys(this.departments).map(dept => ({
        label: dept,
        value: dept,
        description: `Join the ${dept} department`,
        emoji: this.getDepartmentEmoji(dept)
      }))

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('duty_department_select')
        .setPlaceholder('🏢 Select your department')
        .addOptions(departmentOptions)

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu)

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🟢 Clock In - Step 1')
        .setDescription('**Select your department to continue with clock in process**')
        .addFields([
          {
            name: '📋 Available Departments',
            value: Object.keys(this.departments).map(dept => 
              `${this.getDepartmentEmoji(dept)} **${dept}**`
            ).join('\n'),
            inline: false
          }
        ])
        .setFooter({ text: 'Step 1 of 2 • Select your department first' })

      await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        flags: 64 // MessageFlags.Ephemeral
      })
    } catch (error) {
      console.error('Show department selection error:', error)
      if (!interaction.replied && !interaction.deferred && interaction.isRepliable()) {
        try {
          await interaction.reply({
            content: '❌ An error occurred while showing department selection.',
            flags: 64
          })
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError)
        }
      }
    }
  }

  private async handleDepartmentSelection(interaction: any) {
    try {
      if (!interaction.isRepliable()) {
        console.error('❌ Department selection interaction expired');
        return;
      }

      // Check if interaction is from the duty logs server
      if (interaction.guildId !== this.dutyLogsGuildId) {
        await interaction.reply({
          content: '❌ Duty log features are only available in the designated duty logs server.',
          flags: 64
        }).catch(() => {});
        return;
      }

      const department = interaction.values[0];
      await this.showRankSelection(interaction, department);
    } catch (error) {
      console.error('Handle department selection error:', error);
      if (!interaction.replied && !interaction.deferred && interaction.isRepliable()) {
        await interaction.reply({ content: '❌ An error occurred.', flags: 64 }).catch(() => {});
      }
    }
  }

  private async showRankSelection(interaction: any, department: string) {
    try {
      const ranks = this.departments[department as keyof typeof this.departments];
      const rankOptions = ranks.map(rank => ({
        label: rank,
        value: rank,
        description: `${department} - ${rank}`
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`duty_rank_select_${department}`)
        .setPlaceholder('⭐ Select your rank')
        .addOptions(rankOptions);

      const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selectMenu);
      
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🟢 Clock In - Step 2')
        .setDescription(`**Select your rank for the ${department} department**`)
        .setFooter({ text: 'The clock-in form will open after you select a rank.' });

      await interaction.update({
        embeds: [embed],
        components: [actionRow]
      });
    } catch (error) {
      console.error('Show rank selection error:', error);
    }
  }

  private async handleRankSelection(interaction: any) {
    try {
      if (!interaction.isRepliable()) {
        console.error('❌ Rank selection interaction expired');
        return;
      }

      // Check if interaction is from the duty logs server
      if (interaction.guildId !== this.dutyLogsGuildId) {
        await interaction.reply({
          content: '❌ Duty log features are only available in the designated duty logs server.',
          flags: 64
        }).catch(() => {});
        return;
      }
      
      const department = interaction.customId.replace('duty_rank_select_', '');
      const rank = interaction.values[0];
      await this.showFinalClockInModal(interaction, department, rank);
    } catch (error) {
      console.error('Handle rank selection error:', error);
    }
  }

  private async showFinalClockInModal(interaction: any, department: string, rank: string) {
    try {
      // Use a delimiter that won't conflict with department/rank names
      const modal = new ModalBuilder()
        .setCustomId(`duty_final_modal|${department}|${rank}`)
        .setTitle(`🟢 ${department} - ${rank}`)

      const characterNameInput = new TextInputBuilder()
        .setCustomId('character_name')
        .setLabel('Character Name')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Enter your character name')
        .setRequired(true)
        .setMaxLength(50)

      const callSignInput = new TextInputBuilder()
        .setCustomId('call_sign')
        .setLabel('Call Sign')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Your radio call sign (e.g., 1-Adam-12)')
        .setRequired(true)
        .setMaxLength(20)

      const notesInput = new TextInputBuilder()
        .setCustomId('notes')
        .setLabel('Notes (Optional)')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Any additional notes for this shift...')
        .setRequired(false)
        .setMaxLength(200)

      const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(characterNameInput)
      const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(callSignInput)
      const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(notesInput)

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow)

      await interaction.showModal(modal)
    } catch (error) {
      console.error('Show final clock in modal error:', error)
      if (!interaction.replied && !interaction.deferred && interaction.isRepliable()) {
        try {
          await interaction.reply({
            content: '❌ An error occurred while opening the final clock in form.',
            flags: 64
          })
        } catch (replyError) {
          console.error('Failed to send error reply:', replyError)
        }
      }
    }
  }

  private getDepartmentEmoji(department: string): string {
    const emojiMap: { [key: string]: string } = {
      'PD': '👮',
      'EMS': '🚑',
      'Mechanic': '🔧',
      'Merry weather': '🛡️'
    }
    return emojiMap[department] || '🏢'
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
      
      const message = result.success 
        ? '✅ You are now on duty! You can dismiss this message.' 
        : `❌ Clock in failed: ${result.message}`;

      await interaction.editReply({ content: message });

    } catch (error) {
      console.error('❌ Duty clock in modal error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ An unexpected error occurred while processing your clock-in.' });
      }
    }
  }

  private async handleClockOutButton(interaction: any) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const { hasActiveSession } = await DutyLogsAPI.getActiveSession(interaction.user.id);
      if (!hasActiveSession) {
        await interaction.editReply({ content: '❌ You are not currently on duty.' });
        return;
      }

      const result = await DutyLogsAPI.clockOut(interaction.user.id);
      
      const message = result.success 
        ? '✅ You have been clocked out. You can dismiss this message.' 
        : `❌ Clock out failed: ${result.message}`;
      
      await interaction.editReply({ content: message });

    } catch (error) {
      console.error('Clock out button error:', error);
      if (interaction.deferred) {
        await interaction.editReply({ content: '❌ An unexpected error occurred while clocking out.' });
      }
    }
  }

  private async handleDutyStatusButton(interaction: any) {
    try {
      // Defer the reply to prevent timeout
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  
      const { hasActiveSession, session } = await DutyLogsAPI.getActiveSession(interaction.user.id);
  
      const originalEmbed = interaction.message.embeds[0];
      const newEmbed = new EmbedBuilder(originalEmbed.data);
  
      let statusField;
      if (hasActiveSession && session) {
        const clockInTime = new Date(session.clock_in);
        statusField = {
          name: 'Your Status: 🟢 ON DUTY',
          value: `**Character:** ${session.character_name}\n**Clocked In:** <t:${Math.floor(clockInTime.getTime() / 1000)}:R>`,
          inline: false
        };
      } else {
        statusField = {
          name: 'Your Status: 🔴 OFF DUTY',
          value: 'You are not currently clocked in. Click "Clock In" to start a new session.',
          inline: false
        };
      }
  
      // Replace the old status field with the new one
      newEmbed.spliceFields(0, 1, statusField);
  
      await interaction.message.edit({ embeds: [newEmbed] });
  
      // Notify the user silently that the panel has been updated
      await interaction.editReply({ content: '✅ The duty panel has been updated with your status.' });
  
    } catch (error) {
      console.error('Duty status button error:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ An error occurred while refreshing your status.', flags: MessageFlags.Ephemeral });
      } else {
        await interaction.editReply({ content: '❌ An error occurred while refreshing your status.' });
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
}

export default WhitelistBot
export type { WhitelistApplication }