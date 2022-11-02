'use strict';

import { Client, IntentsBitField, VoiceChannel, EmbedBuilder, GatewayIntentBits } from 'discord.js';
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
  const vcIdOld = stateOld.channelId;
  const vcIdNew = stateNew.channelId;
  const guild = stateOld.guild;

  const i = !vcIdOld && vcIdNew ? 1 :
    vcIdOld && !vcIdNew ? 0 : 2

  if (i == 2) return

  const vcId = [vcIdOld, vcIdNew][i];
  const vc = <VoiceChannel>guild.channels.cache.get(<string>vcId);
  const userIds = vc.members.map((_, userId) => userId)

  console.log(vc.name, userIds)

  const embed = {
    color: [0xFF0000, 0x00FF00][i],
    fields: [
      {
        name: 'channel',
        value: `<#${vcId}>`,
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

  vc.send({ embeds: [embed] }).catch(console.error)
});

client.login(process.env.DISCORD_TOKEN);
