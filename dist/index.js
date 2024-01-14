var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch";
import { getHeaders } from "./headers.js";
import TelegramApi from "node-telegram-bot-api";
import { getLink } from "./link.js";
function getOrders(cookie) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch("https://profi.ru/backoffice/api/", {
            headers: getHeaders(cookie),
            body: '------WebKitFormBoundaryHagWMxTwQ9h1Fjwm\r\nContent-Disposition: form-data; name="request"\r\n\r\n{"meta":{"ui_type":"WEB","ui_app":"WEBBO","ui_ver":"1","ui_os":"0.0","method":"findOrders"},"data":{"searchId":"363831","allVerticals":true,"searchQuery":"","pageSize":999,"useSavedFilter":true}}\r\n------WebKitFormBoundaryHagWMxTwQ9h1Fjwm--\r\n',
            method: "POST",
        })
            .then((r) => r.json())
            .then((r) => r.data.orders);
    });
}
const bot = new TelegramApi("6324049612:AAE10Z8W7HfAdtcB1pdGKe-ePuP1Rso5hOw", {
    polling: true,
});
const users = [
    { id: 260095664, sendedOrdersIds: [], requestTimerId: null },
    { id: 495222576, sendedOrdersIds: [], requestTimerId: null },
    { id: 878842607, sendedOrdersIds: [], requestTimerId: null },
];
bot.on("message", (message) => {
    if (message.text === "/stop") {
        const userId = message.chat.id;
        const user = users.find((user) => user.id === userId);
        if (user) {
            clearInterval(user.requestTimerId);
            user.requestTimerId = null;
        }
        else {
            console.log("Not user");
        }
    }
});
bot.onText(/\/loginProfi (.+)/, (message, [source, match]) => __awaiter(void 0, void 0, void 0, function* () {
    const id = message.chat.id;
    const userId = message.chat.id;
    if (!/\S+:\S+/.test(match)) {
        return yield bot.sendMessage(id, "Формат: \n\n /loginProfi login:password");
    }
    const user = users.find((user) => user.id === userId);
    if (!user) {
        return yield bot.sendMessage(id, "Нет доступа к этой команде");
    }
    const [login, password] = match.split(":");
    let cookie = null;
    fetch("https://profi.ru/backoffice/api/", {
        headers: {
            accept: "application/json",
            "accept-language": "ru,en;q=0.9,la;q=0.8",
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryyWWSaLmTigiyAKTf",
            "sec-ch-ua": '"Chromium";v="112", "YaBrowser";v="23", "Not:A-Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-app-id": "BO",
            "x-new-auth-compatible": "1",
            cookie: "prfr_egback_sent=1; uid=8CBABAB91FB0A964D04BFE7602D8DA42; sid=ubq6jGSpsB92/kvQQtrYAg==; intercom-id-bx6ssdy0=bec668ed-ffb9-4b45-a7af-2cc34a1d3077; intercom-session-bx6ssdy0=; intercom-device-id-bx6ssdy0=6353c685-5599-4666-b80c-28d3962d9ab7",
            Referer: "https://profi.ru/backoffice/a.php?action=settings",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `------WebKitFormBoundaryyWWSaLmTigiyAKTf\r\nContent-Disposition: form-data; name="request"\r\n\r\n{"meta":{"ui_type":"WEB","ui_app":"WEBBO","ui_ver":"1","ui_os":"0.0","method":"authenticate"},"data":{"login":"${login}","password":"${password}"}}\r\n------WebKitFormBoundaryyWWSaLmTigiyAKTf--\r\n`,
        method: "POST",
    })
        .then((r) => {
        cookie = r.headers.get("Set-Cookie");
        return r.json();
    })
        .then((data) => __awaiter(void 0, void 0, void 0, function* () {
        if (data.data.result === "ok" && cookie) {
            const requestTimerId = yield sendOrders(id, cookie, user, message.from.username);
            user.requestTimerId = requestTimerId;
        }
    }));
}));
function sendOrders(chatId, cookie, user, telegramUsername) {
    return __awaiter(this, void 0, void 0, function* () {
        let timerMessage = null;
        return setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const orders = yield getOrders(cookie);
            const isNotViewedAndNotSendedOrdersCount = orders.filter((order) => order.isViewed === false && !user.sendedOrdersIds.includes(order.id)).length;
            checkOutdatedOrders(orders, user);
            console.log(`Количество непросмотренных и неотправленных заказов: ${telegramUsername}`, isNotViewedAndNotSendedOrdersCount);
            if (isNotViewedAndNotSendedOrdersCount > 0) {
                if (timerMessage) {
                    yield bot.deleteMessage(chatId, timerMessage.message_id);
                    timerMessage = null;
                }
                for (const order of orders) {
                    if (order.isViewed === false && !user.sendedOrdersIds.includes(order.id)) {
                        user.sendedOrdersIds.push(order.id);
                        yield bot.sendMessage(chatId, (yield getLink(order.id)) + "\n\n" + order.description, {
                            disable_web_page_preview: true,
                        });
                    }
                }
            }
            else {
                let seconds = 10;
                if (!timerMessage) {
                    timerMessage = yield bot.sendMessage(chatId, getAutoUpdateText(seconds));
                }
                const autoUpdateTimerId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    yield bot.editMessageText(getAutoUpdateText(--seconds), {
                        chat_id: timerMessage.chat.id,
                        message_id: timerMessage.message_id,
                    });
                    if (seconds === 0) {
                        clearInterval(autoUpdateTimerId);
                    }
                }), 1000);
            }
        }), 10000);
    });
}
function getAutoUpdateText(seconds) {
    return `Новых заказов нет, автообновление через ${seconds} с`;
}
function checkOutdatedOrders(orders, user) {
    for (const order of orders) {
        const index = user.sendedOrdersIds.indexOf(order.id);
        if (order.isViewed && index !== -1) {
            user.sendedOrdersIds.splice(index, 1);
        }
    }
}
