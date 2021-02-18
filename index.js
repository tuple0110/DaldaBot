const Chart = require("chart.js");

const Discord = require("discord.js");
const client = new Discord.Client();

const JsonBinIoApi = require("jsonbin-io-api");
const api = new JsonBinIoApi(process.env.JSON_TOKEN);
let data;
api.readBin({
    id: "602520643b303d3d964f1ffd",
    version: "latest"
}).then((data2) => {
    data = data2;
    console.log(data);
});

const stringSimilarity = require("string-similarity");

const mcdata = require("mcdata");

const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const cron = require("node-cron");

function saveData() {
    api.updateBin({
        id: "602520643b303d3d964f1ffd",
        data: data,
        versioning: true
    });
}
let kokocityChannel;
let dvxChannel;
client.once("ready", () => {
    kokocityChannel = client.channels.cache.get("810173363485933568");
    dvxChannel = client.channels.cache.get("811508382254628894");
});

client.on("message", (message2) => {
    msg = message2.content.split(" ");
    message = msg.join(" ").replace(/\s\s+/g, " ");
    if (message2.author.id != "809362172852568084") {
        if (message2.channel.id == "809366650498973726") {
            if (!data.bank.account[message2.author.id]) {
                data.bank.account[message2.author.id] = 0;
            }
            switch (true) {
                case /^도움말$/.test(message):
                    message2.reply(`
잔액 : 계좌에 있는 잔액을 조회합니다.
입금 [입금 코드] : 전자 계좌에 입금 코드의 가치에 맞는 돈을 입금합니다.
출금 [100/900/6400/57600] : 출금할 액수에 맞는 출금 아이디와 출금 코드를 발송합니다.
송금 [보낼 유저 태그 (예: <@386031770216300555>)] [송금 액수] : 타 유저에게 돈을 전송합니다.
                    `);
                    break;
                case /^잔액$/.test(message):
                    message2.reply(`현재 고객님의 계좌에는 ${data.bank.account[message2.author.id].toLocaleString()}Đ이 있습니다.`);
                    break;
                case /^입금 [0-9]{5}$/.test(message):
                    if (data.bank.code.in100.includes(msg[1])) {
                        data.bank.account[message2.author.id] += 100;
                        data.bank.code.in100.splice(data.bank.code.in100.indexOf(msg[1]), 1)
                        message2.reply("고객님의 계좌에 100Đ이 입금되었습니다.")
                    } else if (data.bank.code.in900.includes(msg[1])) {
                        data.bank.account[message2.author.id] += 900;
                        data.bank.code.in900.splice(data.bank.code.in900.indexOf(msg[1]), 1)
                        message2.reply("고객님의 계좌에 900Đ이 입금되었습니다.")
                    } else if (data.bank.code.in6400.includes(msg[1])) {
                        data.bank.account[message2.author.id] += 6400;
                        data.bank.code.in6400.splice(data.bank.code.in6400.indexOf(msg[1]), 1)
                        message2.reply("고객님의 계좌에 6,400Đ이 입금되었습니다.")
                    } else if (data.bank.code.in57600.includes(msg[1])) {
                        data.bank.account[message2.author.id] += 57600;
                        data.bank.code.in57600.splice(data.bank.code.in57600.indexOf(msg[1]), 1)
                        message2.reply("고객님의 계좌에 57,600Đ이 입금되었습니다.")
                    } else {
                        message2.reply("사용 불가능한 입금 코드입니다.")
                    }
                    break;
                case /^출금 (100|900|6400|57600)$/.test(message):
                    if (Object.keys(data.bank.code["out" + msg[1]]).length == 1) {
                        message2.reply("전산 상의 출금 코드가 모두 소진되었습니다.");
                    } else if (data.bank.account[message2.author.id] < Number(msg[1])) {
                        message2.reply("잔액이 부족합니다.");
                    } else {
                        message2.author.send(`
고객님의 출금 코드는 ${data.bank.code["out" + msg[1]][Object.keys(data.bank.code["out" + msg[1]])[1]]}입니다.
덴버중앙은행(DCB) 출금 창구 ${Object.keys(data.bank.code["out" + msg[1]])[1]}번 다락문을 열어 다이아몬드를 수령해가시기 바랍니다.
                        `);
                        delete data.bank.code["out" + msg[1]][Object.keys(data.bank.code["out" + msg[1]])[1]];
                        data.bank.account[message2.author.id] -= Number(msg[1]);
                        message2.reply(`고객님의 출금 아이디와 출금 코드가 DM으로 발송되었습니다. 잔액 : ${data.bank.account[message2.author.id]}Đ`);
                    }
                    break;
                case /^송금 <@![0-9]{18}> [1-9][0-9]*$/.test(message):
                    if (data.bank.account[message2.author.id] < Number(msg[2])) {
                        message2.reply("잔액이 부족합니다.");
                    } else {
                        message2.reply(`${msg[1]}님에게 ${msg[2]}Đ을 전송하였습니다. 잔액 : ${data.bank.account[message2.author.id]}Đ`);
                        data.bank.account[message2.author.id] -= Number(msg[2]);
                        if (!data.bank.account[msg[1].slice(3, 21)]) {
                            data.bank.account[msg[1].slice(3, 21)] = 0;
                        }
                        data.bank.account[msg[1].slice(3, 21)] += Number(msg[2]);
                    }
                    break;
            }
            saveData();
        } else if (message2.channel.id == "731149706046210118") {
            switch (true) {
                case /^코드 in(100|900|6400|57600)$/.test(message):
                    var codeResult = "";
                    while (data.bank.code[msg[1]].length <= 41) {
                        var random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
                        if (!data.bank.code.in100.includes(random) && !data.bank.code.in900.includes(random) && !data.bank.code.in6400.includes(random) && !data.bank.code.in57600.includes(random)) {
                            data.bank.code[msg[1]].push(random);
                            codeResult += random + "\n";
                        }
                    }
                    message2.reply(codeResult);
                    break;
                case /^코드 out(100|900|6400|57600)$/.test(message):
                    var codeResult = "";
                    for (var i of ["A", "B", "C", "D", "E"]) {
                        for (var j = 1; j <= 10; i++) {
                            if (!data.bank.code[msg[1]][i + j]) {
                                var random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
                                data.bank.code[msg[1]][i + j] = random;
                                codeResult += i + j + " " + random + "\n";
                            }
                        }
                    }
                    message2.reply(codeResult);
                    break;
                case /^코코주식 <@![0-9]{18}> [0-9]+$/.test(message):
                    data.stock.kokocity.stocks[msg[1].slice(3, 21)] = Number(msg[2]);
                    break;
            }
            saveData();
        } else if (message2.channel.id == "810046656170688522") {
            console.log(message);
            switch (true) {
                case /^도움말$/.test(message):
                    message2.reply(`
달다야 [대화문] : 달다봇이랑 대화하기
달다야 배워 [입력] : [출력] : 달다봇 학습시키기
정보 [유저 태그] : 타 유저 정보 조회
                    `);
                    break;
                case /^정보 (<@![0-9]{18}>|<@[0-9]{18}>)$/.test(message):
                    (async () => {
                        var user = message2.guild.members.cache.find(user => user.id === msg[1].replace(/(@|<|>|!)/, ""));
                        name = user.nickname ? user.nickname : user.user.username;
                        var userData;
                        try {
                            userData = await mcdata.playerStatus(name, {renderSize: 512});
                        } finally {

                        }
                        message2.reply(`
닉네임 : ${user.nickname ? user.nickname : user.user.username}
DCB 잔액 : ${data.bank.account[msg[1].slice(3, 21)]}Đ

                        ` + (userData ? `
    ${userData.skin.avatar}
닉네임 기록 : ${userData.nameHistory.map((x) => x.name)}
스킨 이미지 : ${userData.skin.texture.get}
스킨 다운로드하기 : ${userData.skin.texture.download}
스킨 바로 적용하기 : ${userData.skin.texture.apply}
                        ` : "마인크래프트 정보 불러오기 실패"));
                    })();
                    break;
                case /^달다야 배워/.test(message):
                    if (msg.length >= 3 && message.includes(":")) {
                        var result = "";
                        for (var i of message.slice(7, message.indexOf(":"))) {
                            if (/^[가-힣]$/.test(i)) {
                                result += "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"[Math.floor((i.charCodeAt() - 44032) / 588)];
                                result += "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"[Math.floor((i.charCodeAt() - 44032) % 588 / 28)];
                                result += " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"[(i.charCodeAt() - 44032) % 588 % 28];
                            } else {
                                result += i;
                            }
                        }
                        data.dalda[result] = message.slice(message.indexOf(":") + 1);
                        saveData();
                    }
                    break;
                case /^달다야/.test(message):
                    if (msg.length == 1) {
                        message2.channel.send("ㅇ");
                    } else {
                        var result = "";
                        for (var i of msg.slice(1).join(" ")) {
                            if (/^[가-힣]$/.test(i)) {
                                result += "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"[Math.floor((i.charCodeAt() - 44032) / 588)];
                                result += "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ"[Math.floor((i.charCodeAt() - 44032) % 588 / 28)];
                                result += " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ"[(i.charCodeAt() - 44032) % 588 % 28];
                            } else {
                                result += i;
                            }
                        }
                        message2.channel.send(data.dalda[stringSimilarity.findBestMatch(result, Object.keys(data.dalda).sort(() => 0.5 - Math.random())).bestMatch.target]);
                    }
                    break;
            }
        } else if (message2.channel.id == "810173363485933568") {
            if (!data.bank.account[message2.author.id]) {
                data.bank.account[message2.author.id] = 0;
            }
            if (!data.stock.kokocity.stocks[message2.author.id]) {
                data.stock.kokocity.stocks[message2.author.id] = 0;
            }
            switch (true) {
                case /^매도 [1-9][0-9]{3,} [1-9][0-9]*$/.test(message):
                    var time = new Date();
                    var timeString = `${time.getHours().toString().padStart(2, "0")}${time.getMinutes().toString().padStart(2, "0")}${time.getSeconds().toString().padStart(2, "0")}`;
                    if ((time.getHours() == 23 && time.getMinutes() >= 55) || (time.getHours() == 0 && time.getMinutes() <= 5)) {
                        dvxChannel.send(`<@${message2.author.id}>, 주식 거래 불가능 시간대입니다.`);
                        message2.delete();
                    } else if (Number(msg[2]) > data.stock.kokocity.stocks[message2.author.id]) {
                        dvxChannel.send(`<@${message2.author.id}>, 보유하고 있는 주식이 부족합니다.`);
                        message2.delete();
                    } else {
                        dvxChannel.send(`<@${message2.author.id}>, 매도 주문이 접수되었습니다.`);
                        data.stock.kokocity.stocks[message2.author.id] -= Number(msg[2]);
                        if (data.stock.kokocity.deal[msg[1]]) {
                            data.stock.kokocity.deal[msg[1]].sell.push([message2.author.id, Number(msg[2]), timeString]);
                            data.stock.kokocity.deal[msg[1]].sellTotal += Number(msg[2]);
                        } else {
                            data.stock.kokocity.deal[msg[1]] = {sell: [[message2.author.id, Number(msg[2]), timeString]], buy: [], sellTotal: Number(msg[2]), buyTotal: 0};
                        }
                        kokocityCharts();
                    }
                    saveData();
                    break;
                case /^매수 [1-9][0-9]{3,} [1-9][0-9]*$/.test(message):
                    var time = new Date();
                    var timeString = `${time.getHours().toString().padStart(2, "0")}${time.getMinutes().toString().padStart(2, "0")}${time.getSeconds().toString().padStart(2, "0")}`;
                    if ((time.getHours() == 23 && time.getMinutes() >= 55) || (time.getHours() == 0 && time.getMinutes() <= 5)) {
                        dvxChannel.send(`<@${message2.author.id}>, 주식 거래 불가능 시간대입니다.`);
                        message2.delete();
                    } else if (Number(msg[2]) * Number(msg[1]) > data.bank.account[message2.author.id]) {
                        dvxChannel.send(`<@${message2.author.id}>, 잔액이 부족합니다.`);
                        message2.delete();
                    } else {
                        dvxChannel.send(`<@${message2.author.id}>, 매수 주문이 접수되었습니다.`);
                        data.bank.account[message2.author.id] -= Number(msg[2]) * Number(msg[1]);
                        if (data.stock.kokocity.deal[msg[1]]) {
                            data.stock.kokocity.deal[msg[1]].buy.push([message2.author.id, Number(msg[2]), timeString]);
                            data.stock.kokocity.deal[msg[1]].buyTotal += Number(msg[2]);
                        } else {
                            data.stock.kokocity.deal[msg[1]] = {sell: [], buy: [[message2.author.id, Number(msg[2]), timeString]], sellTotal: 0, buyTotal: Number(msg[2])};
                        }
                        kokocityCharts();
                    }
                    saveData();
                    break;
                default:
                    message2.delete();
                    break;
            }
        }
    }
});

async function kokocityCharts() {
    var canvasRenderService = new ChartJSNodeCanvas({width: 850, height: 400});
    var prices = Object.keys(data.stock.kokocity.deal).sort((a, b) => Number(a) > Number(b) ? 1 : -1);
    var sell = prices.map((a) => -data.stock.kokocity.deal[a].sellTotal);
    var buy = prices.map((a) => data.stock.kokocity.deal[a].buyTotal);
    var image = await canvasRenderService.renderToBuffer({
        type: 'bar',
        data: {
            labels: prices,
            datasets: [
                {
                    label: "SELL",
                    backgroundColor: "#0000FF",
                    data: sell
                },
                {
                    label: "BUY",
                    backgroundColor: "#FF0000",
                    data: buy
                }
            ]
        },
        options: {
            title: {
                display: true,
                text: "PRICE"
            },
            scales: {
                xAxes: [{
                    stacked: true
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function (value, index, values) {
                            return value < 0 ? -value : value
                        }
                    }
                }]
            }
        }
    });
    var date = new Date();
    var id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
    var file = new Discord.MessageAttachment(image, `dom-${id}.png`);
    var embed = new Discord.MessageEmbed().setTitle("호가창").attachFiles([file]).setImage(`attachment://dom-${id}.png`);
    var fetched = await kokocityChannel.messages.fetch({limit: 2});
    kokocityChannel.bulkDelete(fetched);
    kokocityChannel.send({embed});
}

cron.schedule("55 14 * * *", () => {
    console.log("daily");
    var open = 0;
    var high = 0;
    var low = Infinity;
    var close = 0;
    var openTime = "999999";
    var closeTime = "000000";
    var prices = Object.keys(data.stock.kokocity.deal).sort((a, b) => Number(a) > Number(b) ? 1 : -1);
    var sellOffers = [];
    var buyOffers = [];
    console.log(prices);
    console.log(data.stock.kokocity.deal);
    prices.map((price) => {
        if (price != "a") {
            sellOffers = sellOffers.concat(data.stock.kokocity.deal[price].sell.map((offer) => offer.concat([Number(price)])));
            buyOffers = data.stock.kokocity.deal[price].buy.map((offer) => offer.concat([Number(price)])).concat(buyOffers);
        }
    });
    console.log(sellOffers);
    console.log(buyOffers);
    var notice = "";
    var volume = 0;
    for (var i in sellOffers) {
        for (var j in buyOffers) {
            if (buyOffers[j][1] != 0 && buyOffers[j][3] >= sellOffers[i][3]) {
                if (buyOffers[j][1] <= sellOffers[i][1]) {
                    sellOffers[i][1] -= buyOffers[j][1];
                    volume += buyOffers[j][1];
                    notice += `<@${sellOffers[i][0]}> -> <@${buyOffers[j][0]}> 주당 ${sellOffers[i][3].toLocaleString()}Đ에 ${buyOffers[j][1]}주가 거래 체결되었습니다.\n`;
                    data.stock.kokocity.stocks[buyOffers[j][0]] += buyOffers[j][1];
                    data.bank.account[sellOffers[i][0]] += sellOffers[i][3] * buyOffers[j][1];
                    data.bank.account[buyOffers[j][0]] += buyOffers[j][1] * (buyOffers[j][3] - sellOffers[i][3]);
                    if (sellOffers[i][2] < openTime) {
                        openTime = sellOffers[i][2];
                        open = sellOffers[i][3];
                    }
                    if (sellOffers[i][2] >= closeTime) {
                        closeTime = sellOffers[i][2];
                        close = sellOffers[i][3];
                    }
                    if (sellOffers[i][3] < low) {
                        low = sellOffers[i][3];
                    }
                    if (sellOffers[i][3] > high) {
                        high = sellOffers[i][3];
                    }
                    buyOffers[j][1] = 0;
                    if (sellOffers[i][1] == 0) {
                        break;
                    }
                } else if (buyOffers[j][1] > sellOffers[i][1]) {
                    buyOffers[j][1] -= sellOffers[i][1];
                    volume += sellOffers[i][1];
                    notice += `<@${sellOffers[i][0]}> -> <@${buyOffers[j][0]}> 주당 ${sellOffers[i][3].toLocaleString()}Đ에 ${sellOffers[i][1]}주가 거래 체결되었습니다.\n`;
                    data.stock.kokocity.stocks[buyOffers[j][0]] += sellOffers[i][1];
                    data.bank.account[sellOffers[i][0]] += sellOffers[i][3] * sellOffers[i][1];
                    data.bank.account[buyOffers[j][0]] += sellOffers[j][1] * (buyOffers[j][3] - sellOffers[j][3]);
                    if (sellOffers[i][2] < openTime) {
                        openTime = sellOffers[i][2];
                        open = sellOffers[i][3];
                    }
                    if (sellOffers[i][2] >= closeTime) {
                        closeTime = sellOffers[i][2];
                        close = sellOffers[i][3];
                    }
                    if (sellOffers[i][3] < low) {
                        low = sellOffers[i][3];
                    }
                    if (sellOffers[i][3] > high) {
                        high = sellOffers[i][3];
                    }
                    sellOffers[i][1] = 0;
                    break;
                }
            }
        }
    }
    data.stock.kokocity.deal = {"a": 0};
    for (var i of sellOffers) {
        if (i[1] != 0) {
            if (data.stock.kokocity.deal[i[3]]) {
                data.stock.kokocity.deal[i[3]].sell.push(i.slice(0, 3));
                data.stock.kokocity.deal[i[3]].sellTotal += i[1];
            } else {
                data.stock.kokocity.deal[i[3]] = {
                    sell: [i.slice(0, 3)],
                    buy: [],
                    sellTotal: i[1],
                    buyTotal: 0
                };
            }
        }
    }
    for (var i of buyOffers) {
        if (i[1] != 0) {
            if (data.stock.kokocity.deal[i[3]]) {
                data.stock.kokocity.deal[i[3]].buy.push(i.slice(0, 3));
                data.stock.kokocity.deal[i[3]].buyTotal += i[1];
            } else {
                data.stock.kokocity.deal[i[3]] = {
                    sell: [],
                    buy: [i.slice(0, 3)],
                    sellTotal: 0,
                    buyTotal: i[1]
                };
            }
        }
    }
    if (open != 0 || high != 0 || low != Infinity || close != 0) {
        var time = new Date();
        data.stock.kokocity.info.tohlc.push({
            t: time.valueOf(),
            o: open,
            h: high,
            l: low,
            c: close
        });
        data.stock.kokocity.info.date.push(`${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`);
        data.stock.kokocity.info.volume.push(volume);
        (async () => {
            var fetched = await kokocityChannel.messages.fetch({limit: 4});
            kokocityChannel.bulkDelete(fetched);
            var canvasRenderService = new ChartJSNodeCanvas({width: 850, height: 400, chartCallback: (Chart) => {
				/*!
				 * @license
				 * chartjs-chart-financial
				 * http://chartjs.org/
				 * Version: 0.1.0
				 *
				 * Copyright 2020 Chart.js Contributors
				 * Released under the MIT license
				 * https://github.com/chartjs/chartjs-chart-financial/blob/master/LICENSE.md
				 */
				(function (global, factory) {
				typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('chart.js')) :
				typeof define === 'function' && define.amd ? define(['chart.js'], factory) :
				(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Chart));
				}(this, (function (Chart) { 'use strict';

				function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

				var Chart__default = /*#__PURE__*/_interopDefaultLegacy(Chart);

				/*!
				 * Chart.js v3.0.0-beta.7
				 * https://www.chartjs.org
				 * (c) 2020 Chart.js Contributors
				 * Released under the MIT License
				 */
				function isNullOrUndef(value) {
					return value === null || typeof value === 'undefined';
				}
				function isArray(value) {
					if (Array.isArray && Array.isArray(value)) {
						return true;
					}
					const type = Object.prototype.toString.call(value);
					if (type.substr(0, 7) === '[object' && type.substr(-6) === 'Array]') {
						return true;
					}
					return false;
				}
				function isObject(value) {
					return value !== null && Object.prototype.toString.call(value) === '[object Object]';
				}
				function valueOrDefault(value, defaultValue) {
					return typeof value === 'undefined' ? defaultValue : value;
				}
				function clone(source) {
					if (isArray(source)) {
						return source.map(clone);
					}
					if (isObject(source)) {
						const target = Object.create(null);
						const keys = Object.keys(source);
						const klen = keys.length;
						let k = 0;
						for (; k < klen; ++k) {
							target[keys[k]] = clone(source[keys[k]]);
						}
						return target;
					}
					return source;
				}
				function isValidKey(key) {
					return ['__proto__', 'prototype', 'constructor'].indexOf(key) === -1;
				}
				function _merger(key, target, source, options) {
					if (!isValidKey(key)) {
						return;
					}
					const tval = target[key];
					const sval = source[key];
					if (isObject(tval) && isObject(sval)) {
						merge(tval, sval, options);
					} else {
						target[key] = clone(sval);
					}
				}
				function merge(target, source, options) {
					const sources = isArray(source) ? source : [source];
					const ilen = sources.length;
					if (!isObject(target)) {
						return target;
					}
					options = options || {};
					const merger = options.merger || _merger;
					for (let i = 0; i < ilen; ++i) {
						source = sources[i];
						if (!isObject(source)) {
							continue;
						}
						const keys = Object.keys(source);
						for (let k = 0, klen = keys.length; k < klen; ++k) {
							merger(keys[k], target, source, options);
						}
					}
					return target;
				}
				function clipArea(ctx, area) {
					ctx.save();
					ctx.beginPath();
					ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
					ctx.clip();
				}
				function unclipArea(ctx) {
					ctx.restore();
				}
				const supportsEventListenerOptions = (function() {
					let passiveSupported = false;
					try {
						const options = {
							get passive() {
								passiveSupported = true;
								return false;
							}
						};
						window.addEventListener('test', null, options);
						window.removeEventListener('test', null, options);
					} catch (e) {
					}
					return passiveSupported;
				}());

				Chart.defaults.financial = {
					label: '',

					parsing: false,

					hover: {
						mode: 'label'
					},

					datasets: {
						categoryPercentage: 0.8,
						barPercentage: 0.9,
						animation: {
							numbers: {
								type: 'number',
								properties: ['x', 'y', 'base', 'width', 'open', 'high', 'low', 'close']
							}
						}
					},

					scales: {
						x: {
							type: 'timeseries',
							offset: true,
							ticks: {
								major: {
									enabled: true,
								},
								fontStyle: context => context.tick.major ? 'bold' : undefined,
								source: 'data',
								maxRotation: 0,
								autoSkip: true,
								autoSkipPadding: 75,
								sampleSize: 100
							},
							afterBuildTicks: scale => {
								const DateTime = window && window.luxon && window.luxon.DateTime;
								if (!DateTime) {
									return;
								}
								const majorUnit = scale._majorUnit;
								const ticks = scale.ticks;
								const firstTick = ticks[0];

								let val = DateTime.fromMillis(ticks[0].value);
								if ((majorUnit === 'minute' && val.second === 0)
										|| (majorUnit === 'hour' && val.minute === 0)
										|| (majorUnit === 'day' && val.hour === 9)
										|| (majorUnit === 'month' && val.day <= 3 && val.weekday === 1)
										|| (majorUnit === 'year' && val.month === 1)) {
									firstTick.major = true;
								} else {
									firstTick.major = false;
								}
								let lastMajor = val.get(majorUnit);

								for (let i = 1; i < ticks.length; i++) {
									const tick = ticks[i];
									val = DateTime.fromMillis(tick.value);
									const currMajor = val.get(majorUnit);
									tick.major = currMajor !== lastMajor;
									lastMajor = currMajor;
								}
								scale.ticks = ticks;
							}
						},
						y: {
							type: 'linear'
						}
					},

					plugins: {
						tooltip: {
							intersect: false,
							mode: 'index',
							callbacks: {
								label(ctx) {
									const point = ctx.dataPoint;

									if (!isNullOrUndef(point.y)) {
										return Chart.defaults.interaction.callbacks.label(ctx);
									}

									const {o, h, l, c} = point;

									return `O: ${o}  H: ${h}  L: ${l}  C: ${c}`;
								}
							}
						}
					}
				};

				/**
				 * Computes the "optimal" sample size to maintain bars equally sized while preventing overlap.
				 * @private
				 */
				function computeMinSampleSize(scale, pixels) {
					let min = scale._length;
					let prev, curr, i, ilen;

					for (i = 1, ilen = pixels.length; i < ilen; ++i) {
						min = Math.min(min, Math.abs(pixels[i] - pixels[i - 1]));
					}

					for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
						curr = scale.getPixelForTick(i);
						min = i > 0 ? Math.min(min, Math.abs(curr - prev)) : min;
						prev = curr;
					}

					return min;
				}

				/**
				 * This class is based off controller.bar.js from the upstream Chart.js library
				 */
				class FinancialController extends Chart.controllers.bar {

					getLabelAndValue(index) {
						const me = this;
						const parsed = me.getParsed(index);

						const {o, h, l, c} = parsed;
						const value = `O: ${o}  H: ${h}  L: ${l}  C: ${c}`;

						return {
							label: `${me._cachedMeta.iScale.getLabelForValue(parsed.t)}`,
							value
						};
					}

					getAllParsedValues() {
						const parsed = this._cachedMeta._parsed;
						const values = [];
						for (let i = 0; i < parsed.length; ++i) {
							values.push(parsed[i].t);
						}
						return values;
					}

					/**
					 * Implement this ourselves since it doesn't handle high and low values
					 * https://github.com/chartjs/Chart.js/issues/7328
					 * @protected
					 */
					getMinMax(scale) {
						const meta = this._cachedMeta;
						const _parsed = meta._parsed;

						if (_parsed.length < 2) {
							return {min: 0, max: 1};
						}

						if (scale === meta.iScale) {
							return {min: _parsed[0].t, max: _parsed[_parsed.length - 1].t};
						}

						let min = Number.POSITIVE_INFINITY;
						let max = Number.NEGATIVE_INFINITY;
						for (let i = 0; i < _parsed.length; i++) {
							const data = _parsed[i];
							min = Math.min(min, data.l);
							max = Math.max(max, data.h);
						}
						return {min, max};
					}

					_getRuler() {
						const me = this;
						const meta = me._cachedMeta;
						const iScale = meta.iScale;
						const pixels = [];
						for (let i = 0; i < meta.data.length; ++i) {
							pixels.push(iScale.getPixelForValue(me.getParsed(i).t));
						}
						const min = computeMinSampleSize(iScale, pixels);
						return {
							min,
							pixels,
							start: iScale._startPixel,
							end: iScale._endPixel,
							stackCount: me._getStackCount(),
							scale: iScale
						};
					}

					/**
					 * @protected
					 */
					calculateElementProperties(index, ruler, reset, options) {
						const me = this;
						const vscale = me._cachedMeta.vScale;
						const base = vscale.getBasePixel();
						const ipixels = me._calculateBarIndexPixels(index, ruler, options);
						const data = me.chart.data.datasets[me.index].data[index];
						const open = vscale.getPixelForValue(data.o);
						const high = vscale.getPixelForValue(data.h);
						const low = vscale.getPixelForValue(data.l);
						const close = vscale.getPixelForValue(data.c);

						return {
							base: reset ? base : low,
							x: ipixels.center,
							y: (low + high) / 2,
							width: ipixels.size,
							open,
							high,
							low,
							close
						};
					}

					draw() {
						const me = this;
						const chart = me.chart;
						const rects = me._cachedMeta.data;
						clipArea(chart.ctx, chart.chartArea);
						for (let i = 0; i < rects.length; ++i) {
							rects[i].draw(me._ctx);
						}
						unclipArea(chart.ctx);
					}

				}

				const globalOpts = Chart.defaults.global;

				globalOpts.elements.financial = {
					color: {
						up: 'rgba(80, 160, 115, 1)',
						down: 'rgba(215, 85, 65, 1)',
						unchanged: 'rgba(90, 90, 90, 1)',
					}
				};

				/**
				 * Helper function to get the bounds of the bar regardless of the orientation
				 * @param {Rectangle} bar the bar
				 * @param {boolean} [useFinalPosition]
				 * @return {object} bounds of the bar
				 * @private
				 */
				function getBarBounds(bar, useFinalPosition) {
					const {x, y, base, width, height} = bar.getProps(['x', 'low', 'high', 'width', 'height'], useFinalPosition);

					let left, right, top, bottom, half;

					if (bar.horizontal) {
						half = height / 2;
						left = Math.min(x, base);
						right = Math.max(x, base);
						top = y - half;
						bottom = y + half;
					} else {
						half = width / 2;
						left = x - half;
						right = x + half;
						top = Math.min(y, base); // use min because 0 pixel at top of screen
						bottom = Math.max(y, base);
					}

					return {left, top, right, bottom};
				}

				function inRange(bar, x, y, useFinalPosition) {
					const skipX = x === null;
					const skipY = y === null;
					const bounds = !bar || (skipX && skipY) ? false : getBarBounds(bar, useFinalPosition);

					return bounds
						&& (skipX || x >= bounds.left && x <= bounds.right)
						&& (skipY || y >= bounds.top && y <= bounds.bottom);
				}

				class FinancialElement extends Chart.Element {

					height() {
						return this.base - this.y;
					}

					inRange(mouseX, mouseY, useFinalPosition) {
						return inRange(this, mouseX, mouseY, useFinalPosition);
					}

					inXRange(mouseX, useFinalPosition) {
						return inRange(this, mouseX, null, useFinalPosition);
					}

					inYRange(mouseY, useFinalPosition) {
						return inRange(this, null, mouseY, useFinalPosition);
					}

					getRange(axis) {
						return axis === 'x' ? this.width / 2 : this.height / 2;
					}

					getCenterPoint(useFinalPosition) {
						const {x, low, high} = this.getProps(['x', 'low', 'high'], useFinalPosition);
						return {
							x,
							y: (high + low) / 2
						};
					}

					tooltipPosition(useFinalPosition) {
						const {x, open, close} = this.getProps(['x', 'open', 'close'], useFinalPosition);
						return {
							x,
							y: (open + close) / 2
						};
					}
				}

				const globalOpts$1 = Chart.defaults.global;

				class CandlestickElement extends FinancialElement {
					draw(ctx) {
						const me = this;

						const {x, open, high, low, close} = me;

						let borderColors = me.borderColor;
						if (typeof borderColors === 'string') {
							borderColors = {
								up: borderColors,
								down: borderColors,
								unchanged: borderColors
							};
						}

						let borderColor;
						if (close < open) {
							borderColor = valueOrDefault(borderColors ? borderColors.up : undefined, globalOpts$1.elements.candlestick.borderColor);
							ctx.fillStyle = valueOrDefault(me.color ? me.color.up : undefined, globalOpts$1.elements.candlestick.color.up);
						} else if (close > open) {
							borderColor = valueOrDefault(borderColors ? borderColors.down : undefined, globalOpts$1.elements.candlestick.borderColor);
							ctx.fillStyle = valueOrDefault(me.color ? me.color.down : undefined, globalOpts$1.elements.candlestick.color.down);
						} else {
							borderColor = valueOrDefault(borderColors ? borderColors.unchanged : undefined, globalOpts$1.elements.candlestick.borderColor);
							ctx.fillStyle = valueOrDefault(me.color ? me.color.unchanged : undefined, globalOpts$1.elements.candlestick.color.unchanged);
						}

						ctx.lineWidth = valueOrDefault(me.borderWidth, globalOpts$1.elements.candlestick.borderWidth);
						ctx.strokeStyle = valueOrDefault(borderColor, globalOpts$1.elements.candlestick.borderColor);

						ctx.beginPath();
						ctx.moveTo(x, high);
						ctx.lineTo(x, Math.min(open, close));
						ctx.moveTo(x, low);
						ctx.lineTo(x, Math.max(open, close));
						ctx.stroke();
						ctx.fillRect(x - me.width / 2, close, me.width, open - close);
						ctx.strokeRect(x - me.width / 2, close, me.width, open - close);
						ctx.closePath();
					}
				}

				CandlestickElement.id = 'candlestick';
				CandlestickElement.defaults = merge({}, [globalOpts$1.elements.financial, {
					borderColor: globalOpts$1.elements.financial.color.unchanged,
					borderWidth: 1,
				}]);

				class CandlestickController extends FinancialController {

					updateElements(elements, start, count, mode) {
						const me = this;
						const dataset = me.getDataset();
						const ruler = me._ruler || me._getRuler();
						const firstOpts = me.resolveDataElementOptions(start, mode);
						const sharedOptions = me.getSharedOptions(firstOpts);
						const includeOptions = me.includeOptions(mode, sharedOptions);

						me.updateSharedOptions(sharedOptions, mode, firstOpts);

						for (let i = start; i < count; i++) {
							const options = sharedOptions || me.resolveDataElementOptions(i, mode);

							const baseProperties = me.calculateElementProperties(i, ruler, mode === 'reset', options);
							const properties = {
								...baseProperties,
								datasetLabel: dataset.label || '',
								// label: '', // to get label value please use dataset.data[index].label

								// Appearance
								color: dataset.color,
								borderColor: dataset.borderColor,
								borderWidth: dataset.borderWidth,
							};

							if (includeOptions) {
								properties.options = options;
							}
							me.updateElement(elements[i], i, properties, mode);
						}
					}

				}

				CandlestickController.id = 'candlestick';
				CandlestickController.defaults = merge({
					dataElementType: CandlestickElement.id
				}, Chart__default['default'].defaults.financial);

				const globalOpts$2 = Chart.defaults.global;

				class OhlcElement extends FinancialElement {
					draw(ctx) {
						const me = this;

						const {x, open, high, low, close} = me;

						const armLengthRatio = valueOrDefault(me.armLengthRatio, globalOpts$2.elements.ohlc.armLengthRatio);
						let armLength = valueOrDefault(me.armLength, globalOpts$2.elements.ohlc.armLength);
						if (armLength === null) {
							// The width of an ohlc is affected by barPercentage and categoryPercentage
							// This behavior is caused by extending controller.financial, which extends controller.bar
							// barPercentage and categoryPercentage are now set to 1.0 (see controller.ohlc)
							// and armLengthRatio is multipled by 0.5,
							// so that when armLengthRatio=1.0, the arms from neighbour ohcl touch,
							// and when armLengthRatio=0.0, ohcl are just vertical lines.
							armLength = me.width * armLengthRatio * 0.5;
						}

						if (close < open) {
							ctx.strokeStyle = valueOrDefault(me.color ? me.color.up : undefined, globalOpts$2.elements.ohlc.color.up);
						} else if (close > open) {
							ctx.strokeStyle = valueOrDefault(me.color ? me.color.down : undefined, globalOpts$2.elements.ohlc.color.down);
						} else {
							ctx.strokeStyle = valueOrDefault(me.color ? me.color.unchanged : undefined, globalOpts$2.elements.ohlc.color.unchanged);
						}
						ctx.lineWidth = valueOrDefault(me.lineWidth, globalOpts$2.elements.ohlc.lineWidth);

						ctx.beginPath();
						ctx.moveTo(x, high);
						ctx.lineTo(x, low);
						ctx.moveTo(x - armLength, open);
						ctx.lineTo(x, open);
						ctx.moveTo(x + armLength, close);
						ctx.lineTo(x, close);
						ctx.stroke();
					}
				}

				OhlcElement.id = 'ohlc';
				OhlcElement.defaults = merge({}, [globalOpts$2.elements.financial, {
					lineWidth: 2,
					armLength: null,
					armLengthRatio: 0.8,
				}]);

				class OhlcController extends FinancialController {

					updateElements(elements, start, count, mode) {
						const me = this;
						const dataset = me.getDataset();
						const ruler = me._ruler || me._getRuler();
						const firstOpts = me.resolveDataElementOptions(start, mode);
						const sharedOptions = me.getSharedOptions(firstOpts);
						const includeOptions = me.includeOptions(mode, sharedOptions);

						for (let i = 0; i < count; i++) {
							const options = sharedOptions || me.resolveDataElementOptions(i, mode);

							const baseProperties = me.calculateElementProperties(i, ruler, mode === 'reset', options);
							const properties = {
								...baseProperties,
								datasetLabel: dataset.label || '',
								lineWidth: dataset.lineWidth,
								armLength: dataset.armLength,
								armLengthRatio: dataset.armLengthRatio,
								color: dataset.color,
							};

							if (includeOptions) {
								properties.options = options;
							}
							me.updateElement(elements[i], i, properties, mode);
						}
					}

				}

				OhlcController.id = 'ohlc';
				OhlcController.defaults = merge({
					dataElementType: OhlcElement.id,
					datasets: {
						barPercentage: 1.0,
						categoryPercentage: 1.0
					}
				}, Chart.defaults.financial);

				Chart.plugins.register(CandlestickController, OhlcController, CandlestickElement, OhlcElement);
				Chart.controllers.candlestick = CandlestickController;

				})));
            }});
            var image = await canvasRenderService.renderToBuffer({
                type: 'candlestick',
                data: {
                    datasets: [
                        {
                            label: "Daily Chart",
                            data: data.stock.kokocity.info.tohlc
                        }
                    ]
                }
            });
            var date = new Date();
            var id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
            var file = new Discord.MessageAttachment(image, `daily-${id}.png`);
            var embed = new Discord.MessageEmbed().setTitle("일봉 차트").attachFiles([file]).setImage(`attachment://daily-${id}.png`);
            console.log("chart");
            kokocityChannel.send({embed});
            console.log("chart");

            canvasRenderService = new ChartJSNodeCanvas({width: 850, height: 400});
            image = await canvasRenderService.renderToBuffer({
                type: 'bar',
                data: {
                    labels: data.stock.kokocity.info.date,
                    datasets: [
                        {
                            label: "VOLUME",
                            backgroundColor: "#00FF00",
                            data: sell
                        }
                    ]
                }
            });
            date = new Date();
            id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
            file = new Discord.MessageAttachment(image, `volume-${id}.png`);
            embed = new Discord.MessageEmbed().setTitle("거래량 차트").attachFiles([file]).setImage(`attachment://volume-${id}.png`);
            kokocityChannel.send({embed});

            kokocityChannel.send(
`_증권 정보_
**코코시티** ${close.toLocaleString()} _${data.stock.kokocity.info.tohlc[data.stock.kokocity.info.tohlc.length - 2].c <= close ? "▲" : "▼"} ${Math.abs(close - data.stock.kokocity.info.tohlc[data.stock.kokocity.info.tohlc.length - 2].c).toLocaleString()}_
전일종가 : ${data.stock.kokocity.info.tohlc[data.stock.kokocity.info.tohlc.length - 2].c} 고가 : ${high.toLocaleString()} 저가 : ${low.toLocaleString()}
거래량 : ${volume} 시가 총액 : ${(close * 41).toLocaleString()} DESPI : ${(close * 41 / 410 * 100).toLocaleString()}
`
            );

            canvasRenderService = new ChartJSNodeCanvas({width: 850, height: 400});
            var prices = Object.keys(data.stock.kokocity.deal).sort((a, b) => Number(a) > Number(b) ? 1 : -1);
            var sell = prices.map((a) => -data.stock.kokocity.deal[a].sellTotal);
            var buy = prices.map((a) => data.stock.kokocity.deal[a].buyTotal);
            image = await canvasRenderService.renderToBuffer({
                type: 'bar',
                data: {
                    labels: prices,
                    datasets: [
                        {
                            label: "SELL",
                            backgroundColor: "#0000FF",
                            data: sell
                        },
                        {
                            label: "BUY",
                            backgroundColor: "#FF0000",
                            data: buy
                        }
                    ]
                },
                options: {
                    title: {
                        display: true,
                        text: "PRICE"
                    },
                    scales: {
                        xAxes: [{
                            stacked: true
                        }],
                        yAxes: [{
                            stacked: true,
                            ticks: {
                                callback: function (value, index, values) {
                                    return value < 0 ? -value : value
                                }
                            }
                        }]
                    }
                }
            });
            date = new Date();
            id = `${date.getFullYear()}${date.getMonth()}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
            file = new Discord.MessageAttachment(image, `dom-${id}.png`);
            embed = new Discord.MessageEmbed().setTitle("호가창").attachFiles([file]).setImage(`attachment://dom-${id}.png`);
            kokocityChannel.send({embed});
        })();
    }
    dvxChannel.send(notice);
    saveData();
}, {
    scheduled: true,
    timezone: "Asia/Seoul"
}).start();

client.login(process.env.BOT_TOKEN);
