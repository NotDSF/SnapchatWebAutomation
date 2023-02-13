const Snapchat = require(".");

(async () => {
	const client = await Snapchat.Login();
    const chats = await client.GetChats();
	await client.OpenChat(chats[0]); // open first chat

    // event only fires when a chat is open
	client.events.on("message", async (message) => {
        console.log(message);
		if (message.content === "ping") {
			await client.SendMessage("pong!");
		}
	});
})();