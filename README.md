# Snapchat Web Automation
Allows you to automate tasks on Snapchat Web
- [API](#api)
- [Example](#example)

## How to authenticate
Once calling the function `Snapchat.Login` we will boot up all the essentials for the client, if you aren't authenticated we will wait for you to log in to your snapchat account before continuing execution of the program. If authentication exists you should still call this function as it handles events etc
> To remove your data delete the `user_data` folder

---

## API

### Get Friend Data
This contains the exact data returned from the snapchat API on friend information.
```js
Snapchat.friends <array>
```

### Message Event
Event fires every time a message is sent within the current channel.
```js
Snapchat.events.on("message")
```

### (async) Snapchat.Login
This function initializes and loads up snapchat web, if you already authenticated it won't go through the authentication process.
```js
await Snapchat.Login(<void>) : void
```

### (async) Snapchat.CloseChat
This function closes the current chat active on the browser.
```js
await Snapchat.CloseChat(<void>) : void
```

### (async) Snapchat.OpenChat
This function opens a chat within the browser.
```js
await Snapchat.OpenChat(<string name>) : void
```

### (async) Snapchat.GetChats
This function returns an array of chat names on your account.
```js
await Snapchat.GetChats(<void>) : [string...]
```

### (async) Snapchat.GetMessages
This function returns an array of all messages within the current channel.
```js
await Snapchat.GetMessages(<void>): [{ author: string, content: string }...]
```

### (async) Snapchat.SendMessage
This function sends a message in the current channel.
```js
await Snapchat.SendMessage(<string message>) : void
```

---

## Example
```js
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
```
