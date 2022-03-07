'use strict';

import { VoiceState, Client, Intents, TextChannel, MessageEmbedOptions } from 'discord.js';
require('dotenv').config()

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
});

client.on('ready', () => {
  console.log(`${client.user?.tag} logged in`);
});

client.on('voiceStateUpdate', async (stateOld: VoiceState, stateNew: VoiceState) => {
  const vcIdNew = stateNew.channelId;
  const vcIdOld = stateOld.channelId;
  const guild = stateOld.guild;

  if (vcIdOld || vcIdNew)
    guild.channels.cache
      .filter(channel => channel.isText())
      .forEach(channel => {

        const tc = <TextChannel>channel;
        const match = tc.topic?.match(/(?<=!vc-notify:)[0-9,]+/);
        if (!match) return;

        const vcIds = match[0].split(',')
        const embeds: MessageEmbedOptions[] = [];
        for (const i of [0, 1]) {
          const vcId = [vcIdOld, vcIdNew][i];
          if (vcId && vcIds.includes(vcId)) {
            const userId = [stateOld, stateNew][i].id;
            const userIds = guild.voiceStates.cache.map((_, userId) => userId).filter(x => [x != userId, true][i]);

            embeds.push({
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
              ],
            });
          }
        }

        if (0 < embeds.length)
          tc.send({ embeds });
      });
});

client.login(process.env.DISCORD_TOKEN);
