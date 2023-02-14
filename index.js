const puppeteer = require("puppeteer");
const { existsSync } = require("fs");
const ncp = require("copy-paste");
const { EventEmitter } = require("node:events");

class SnapchatEvent extends EventEmitter { }

let page;
let browser;
let inchat;

const emitter = new SnapchatEvent();

module.exports = new class Snapchat {
	events = emitter;

	async Login() {
		return new Promise(async (resolve) => {
			const gbrowser = browser || await puppeteer.launch({ headless: false, userDataDir: "./user_data" });
			const gpage = await gbrowser.newPage();

			page = gpage;
			browser = gbrowser;

			await page.exposeFunction("debug", (...a) => console.log(...a));
			await page.exposeFunction("error", (...a) => console.error(...a));
			await page.goto("https://web.snapchat.com");

			const friends = await page.waitForResponse((response) => {
				return response.url().match("friends");
			}, { timeout: 0 });
			this.friends = await friends.json();
			this._loggedin = true;

			await page.waitForSelector("#root > div.Fpg8t > div.BL7do > nav > div:nth-child(1) > div > div > div:nth-child(1) > div > div.LNwMF", {
				visible: true
			});

			let LastMessages;
			setInterval(async () => {
				if (!inchat) return;

				if (!LastMessages) {
					LastMessages = await this.GetMessages();
					return;
				}

				const Messages = await this.GetMessages();
				if (Messages.length > LastMessages.length) {
					let data = [...Messages].pop();
					data.channel = inchat;
					this.events.emit("message", data);
				}

				LastMessages = Messages;
			}, 10);

			resolve(this);
		})
	}

	async CloseChat() {
		if (!this._loggedin) {
			throw "You need to initialize Snapchat using Snapchat.Login before using this function";
		}

		inchat = false;
		return await page.evaluate(() => document.getElementsByClassName("enQRR eKaL7")[0].click());
	}

	async OpenChat(name) {
		if (!this._loggedin) {
			throw "You need to initialize Snapchat using Snapchat.Login before using this function";
		}

		return new Promise(async (resolve, reject) => {
			await page.evaluate((name) => {
				let Index = Array.from(document.getElementsByClassName("FiLwP")).findIndex(child => child.textContent === name);
				if (Index < 0) return error(`Couldn't find chat "${name}"`);

				document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children[Index].children[0].click();
			}, name);

			await page.waitForSelector("#root > div.Fpg8t > div.Vbjsg.WJjwl > div > div > div > div.NvRM8")
			try {
				await page.waitForSelector("#root > div.Fpg8t > div.Vbjsg.WJjwl > div > div > div > div.NvRM8.vhccd > div.IBqK8 > div.ejVI4 > div", { timeout: 2000 });
				await page.click("#root > div.Fpg8t > div.Vbjsg.WJjwl > div > div > div > div.NvRM8.vhccd > div.IBqK8 > div.ejVI4 > div");
			} catch (er) {
				console.log(`Was present in ${name}`);
			}

			inchat = name;
			resolve();
		});
	}

	async GetChats() {
		if (!this._loggedin) {
			throw "You need to initialize Snapchat using Snapchat.Login before using this function";
		}

		return await page.evaluate(() => {
			let chats = [];
			for (let chat of document.getElementsByClassName("FiLwP")) {
				chats.push(chat.textContent);
			}
			return chats;
		});
	}

	async GetMessages() {
		if (!this._loggedin) {
			throw "You need to initialize Snapchat using Snapchat.Login before using this function";
		}

		return await page.evaluate(() => {
			let msgs = document.getElementsByClassName("T1yt2");
			let data = [];
			for (let message of msgs) {
				let Author = message.getElementsByClassName("R1ne3")
				if (!Author) {
					continue;
				}

				let embedded = message.getElementsByClassName("bJaPL")[0]
				if (!embedded) {
					continue;
				}

				for (let independant of embedded.children) {
					data.push({
						author: Author[0].textContent,
						content: independant.textContent
					})
				}
			}
			return data;
		});
	}

	async SendMessage(content) {
		if (!this._loggedin) {
			throw "You need to initialize Snapchat using Snapchat.Login before using this function";
		}
		
		return new Promise(async (resolve) => {
			ncp.copy(content, async function () {
				await page.keyboard.down('Control')
				await page.keyboard.press('V')
				await page.keyboard.up('Control');
				await page.keyboard.down("Enter");
				await page.keyboard.up("Enter");
				resolve();
			});
		});
	}
}