'use strict';

require('dotenv').config()
const discord = require('discord.js');

const client = new discord.Client();

const tcs = [];
client.on('ready', message => {
  for (const channel of client.channels.cache)
    if (channel.type == 'text' && channel.topic) {
      const vcs = topic.match(/(?<=!vc-notify:)[0-9,]+/);
      if (vcs)
        tcs.push({
          tc: channel,
          vcIds: vcs.split(',').map(parseInt),
        });
    }
});

client.on('voiceStateUpdate', (stateOld, stateNew) => {
  console.log('voice state updated');

  const channelIdNew = stateNew.channelID;
  const channelIdOld = stateOld.channelID;

  let action = null;
  let vc = null;

  // connect
  if (!channelIdOld && channelIdNew) {
    action = 'in';
    vc = client.channels.cache.get(channelIdNew);
    state = stateNew;
  }
  // disconnect
  else if (channelIdOld && !channelIdNew) {
    action = 'out';
    vc = client.channels.cache.get(channelIdOld);
    state = stateOld;
  }

  if (action)
    for (const { tc, vcIds } of tcs)
      if (vcIds.includes(vc.guild.id)) {
        const username = client.guilds.cache
          .get(vc.guild.id)
          .members.cache.get(state.id).user.username;

        const usernames = Array.from(channel.guild.voiceStates.cache.keys())
          .map(userId => vc.guild.members.cache.get(userId).user.username)
          .filter(x => (action == 'out' ? x !== username : true));
        tc.send(
          `VC/${channel.name}/${action}/${username}\n> {${usernames.join(', ')}}`
        );
      }
});

client.login(process.env.DISCORD_TOKEN);
