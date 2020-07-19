const discord = require("discord.js");
const client = new discord.Client();

let channelsNotify = [];

client.login(process.env.discord_bot_token);

client.on("ready", message => {
  console.log("ready");

  channelsNotify = client.channels.cache
    .array()
    .filter(
      channel =>
        channel.type === "text" &&
        channel.topic &&
        channel.topic.includes("/vc-notify")
    );

  console.log("/ready");
});

client.on("voiceStateUpdate", (stateOld, stateNew) => {
  console.log("voice state update");

  for (const channelNotify of channelsNotify) {
    const channelIdNew = stateNew.channelID;
    const channelIdOld = stateOld.channelID;

    let kind = null;
    let channel = null;
    let state = null;

    if (!channelIdOld && channelIdNew) {
      kind = "in";
      channel = client.channels.cache.get(channelIdNew);
      state = stateNew;
    } else if (!channelIdNew) {
      kind = "out";
      channel = client.channels.cache.get(channelIdOld);
      state = stateOld;
    }

    if (kind && channel.guild.id === channelNotify.guild.id) {
      const username = client.guilds.cache
        .get(channel.guild.id)
        .members.cache.get(state.id).user.username;

      const userIds = Array.from(channel.guild.voiceStates.cache.keys());
      const usernames = userIds
        .map(userId => channel.guild.members.cache.get(userId).user.username)
        .filter(x => (kind == "out" ? x !== username : true));
      channelNotify.send(
        `VC/${channel.name}/${kind}/${username}\n\\> {${usernames.join(", ")}}`
      );
    }
  }

  console.log("/voice state update");
});
