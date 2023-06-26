'use strict';

import { Client, VoiceChannel, GatewayIntentBits, VoiceState } from 'discord.js';
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.on('ready', () => {
  console.log(`${client.user?.tag} logged in`);
});

const sendStateChange = (state: VoiceState, leaves: boolean) => {
  try {
    const guild = state.guild;
    const voiceChannelId = state.channelId;
    const voiceChannel = <VoiceChannel>guild.channels.cache.get(<string>voiceChannelId);
    const userIds = voiceChannel.members.map((_, userId) => userId)

    const user = guild.members.cache.get(state.id)
    console.log(`${user?.displayName} (${user?.id}) ${leaves ? 'leaves' : 'enters'} ${voiceChannel.name} (${voiceChannel.id})`)

    const embed = {
      color: leaves ? 0xFF0000 : 0x00FF00,
      fields: [
        {
          name: 'channel',
          value: `<#${voiceChannelId}>`,
          inline: true,
        },
        {
          name: 'event',
          value: `<@${state.id}> ${leaves ? 'out' : 'in'}`,
          inline: true,
        },
        {
          name: 'result',
          value: userIds.map(x => `<@${x}>`).join(' ') || 'none',
          inline: true,
        },
      ]
    }

    voiceChannel.send({ embeds: [embed] }).catch(console.error)
  } catch (e) {
    console.error(e);
  }
}

client.on('voiceStateUpdate', async (stateOld, stateNew) => {
  if (stateOld.channelId) {
    if (stateNew.channelId) {
      if (stateOld.channelId != stateNew.channelId) {
        sendStateChange(stateOld, true);
        sendStateChange(stateNew, false);
      }
    }
    else
      sendStateChange(stateOld, true);
  }
  else {
    if (stateNew.channelId)
      sendStateChange(stateNew, false);
    else
      return
  }
});

if (!process.env.DISCORD_TOKEN)
  throw 'set DISCORD_TOKEN';

client.login(process.env.DISCORD_TOKEN);
