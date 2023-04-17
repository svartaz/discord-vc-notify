'use strict';

import { Client, VoiceChannel, GatewayIntentBits } from 'discord.js';
require('dotenv').config()

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

client.on('voiceStateUpdate', async (stateOld, stateNew) => {
  const voiceChannelIdOld = stateOld.channelId;
  const voiceChannelIdNew = stateNew.channelId;
  const guild = stateOld.guild;

  const i =
    voiceChannelIdOld && !voiceChannelIdNew ? 0 :
      !voiceChannelIdOld && voiceChannelIdNew ? 1 :
        null

  if (i == null) return

  const voiceChannelId = [voiceChannelIdOld, voiceChannelIdNew][i];
  const voiceChannel = <VoiceChannel>guild.channels.cache.get(<string>voiceChannelId);
  const userIds = voiceChannel.members.map((_, userId) => userId)

  console.log(voiceChannel.name, userIds)

  const embed = {
    color: [0xFF0000, 0x00FF00][i],
    fields: [
      {
        name: 'channel',
        value: `<#${voiceChannelId}>`,
        inline: true,
      },
      {
        name: 'event',
        value: `<@${[stateOld, stateNew][i].id}> ${['out', 'in'][i]}`,
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
});

client.login(process.env.DISCORD_TOKEN);
