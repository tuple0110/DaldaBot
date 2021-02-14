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

const { CanvasRenderService } = require("chartjs-node-canvas");

function saveData() {
    api.updateBin({
        id: "602520643b303d3d964f1ffd",
        data: data,
        versioning: true
    });
}

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
            switch (true) {
                case /^도움말$/.test(message):
                    message2.reply(`
달다야 [대화문] : 달다봇이랑 대화하기
달다야 배워 [입력] : [출력] : 달다봇 학습시키기
정보 [유저 태그] : 타 유저 정보 조회
                    `);
                    break;
                case /^정보 <@![0-9]{18}>$/.test(message):
                    (async () => {
                        var user = message2.guild.members.cache.find(user => user.id === msg[1].slice(3, 21));
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
            message2.channel.send("**호가창**");
            switch (true) {
                case /^매도 [1-9][0-9]* [1-9][0-9]*$/.test(message):
                    console.log("매도");
                    if (data.stock.kokocity.deal[msg[1]]) {
                        data.stock.kokocity.deal[msg[1]].sell.push([message2.author.id, Number(msg[2])]);
                        data.stock.kokocity.deal[msg[1]].sellTotal += Number(msg[2]);
                    } else {
                        data.stock.kokocity.deal[msg[1]] = {sell: [[message2.author.id, Number(msg[2])]], buy: [], sellTotal: Number(msg[2]), buyTotal: 0};
                    }
                    dom();
                    break;
                case /^매수 [1-9][0-9]* [1-9][0-9]*$/.test(message):
                    if (data.stock.kokocity.deal[msg[1]]) {
                        data.stock.kokocity.deal[msg[1]].buy.push([message2.author.id, Number(msg[2])]);
                        data.stock.kokocity.deal[msg[1]].buyTotal += Number(msg[2]);
                    } else {
                        data.stock.kokocity.deal[msg[1]] = {sell: [], buy: [[message2.author.id, Number(msg[2])]], sellTotal: 0, buyTotal: Number(msg[2])};
                    }
                    dom();
                    break;
            }
        }
    }
});

async function dom() {
    let embed = new Discord.MessageEmbed();
    const canvas = Canvas.createCanvas(900, 1600);
    const ctx = canvas.getContext("2d");
    const canvasRenderService = new CanvasRenderService(width, height, (ChartJS) => { });
    const prices = Object.keys(data.stock.kokocity.deal).sort((a, b) => Number(a) > Number(b) ? 1 : -1);
    const image = await canvasRenderService.renderToBuffer({
        type: 'horizontalBar',
        data: {
            labels: prices,
            datasets: [
                {
                    label: "매도",
                    fillColor: "blue",
                    data: prices.map((a) => data.stock.kokocity.deal[a].sellTotal)
                },
                {
                    label: "매수",
                    fillColor: "red",
                    data: prices.map((a) => data.stock.kokocity.deal[a].buyTotal)
                }
            ]
        },
        options: {
            scales: {
                xAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ],
                yAxes: [
                    {
                        stacked: true
                    }
                ]
            }
        }
    });
    const attachment = new Discord.MessageAttachment(image, "image.png");
    embed.attachFiles(attachment);
    embed.setImage("attachment://image.png");
    message2.channel.fetchMessage("810396566560964608").edit(embed);
}

client.login(process.env.BOT_TOKEN);
