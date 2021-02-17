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
                    break;
                    saveData();
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

cron.schedule("50 23 * * *", () => {
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
    prices.map((price) => {
        if (price != "a") {
            sellOffers += data.stock.kokocity.deal[price].sell.map((offer) => offer + [Number(price)]);
            buyOffers = data.stock.kokocity.deal[price].buy.map((offer) => offer + [Number(price)]) + buyOffers;
        }
    });
    var notice = "";
    var volume = 0;
    for (var i in sellOffers) {
        for (var j in buyOffers) {
            if (buyOffers[j][1] != 0 && buyOffers[j][3] >= sellOffers[i][3]) {
                if (buyOffers[j][1] <= sellOffers[i][1]) {
                    sellOffers[i][1] -= buyOffers[j][1];
                    buyOffers[j][1] = 0;
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
                    if (buyOffers[j][1] == sellOffers[i][1]) {
                        break;
                    }
                } else if (buyOffers[j][3] > sellOffers[i][3]) {
                    buyOffers[j][1] -= sellOffers[i][1];
                    sellOffers[i][1] = 0;
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
            var canvasRenderService = new ChartJSNodeCanvas({width: 850, height: 400});
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
            kokocityChannel.send({embed});

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
