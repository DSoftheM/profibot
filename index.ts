import fetch from "node-fetch";
import { getHeaders } from "./headers.js";
import TelegramApi from "node-telegram-bot-api";
import { getLink } from "./link.js";
import type { Order, OrdersResponse, User } from "./types";

async function getOrders(cookie: string): Promise<Order[]> {
    return fetch("https://profi.ru/backoffice/api/", {
        headers: getHeaders(cookie),
        body: '------WebKitFormBoundaryHagWMxTwQ9h1Fjwm\r\nContent-Disposition: form-data; name="request"\r\n\r\n{"meta":{"ui_type":"WEB","ui_app":"WEBBO","ui_ver":"1","ui_os":"0.0","method":"findOrders"},"data":{"searchId":"363831","allVerticals":true,"searchQuery":"","pageSize":999,"useSavedFilter":true}}\r\n------WebKitFormBoundaryHagWMxTwQ9h1Fjwm--\r\n',
        method: "POST",
    })
        .then((r) => r.json())
        .then((r: OrdersResponse) => r.data.orders);
}

const bot = new TelegramApi("", {
    polling: true,
});

const users: User[] = [
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
        } else {
            console.log("Not user");
        }
    }
});

bot.onText(/\/loginProfi (.+)/, async (message, [source, match]) => {
    const id = message.chat.id;
    const userId = message.chat.id;

    if (!/\S+:\S+/.test(match)) {
        return await bot.sendMessage(id, "Формат: \n\n /loginProfi login:password");
    }

    const user = users.find((user) => user.id === userId);
    if (!user) {
        return await bot.sendMessage(id, "Нет доступа к этой команде");
    }

    const [login, password] = match.split(":");
    let cookie: string | null = null;

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
        .then(async (data: any) => {
            if (data.data.result === "ok" && cookie) {
                const requestTimerId = await sendOrders(id, cookie, user, message.from.username);
                user.requestTimerId = requestTimerId;
            }
        });
});

async function sendOrders(chatId: number, cookie: string, user: User, telegramUsername: string) {
    let timerMessage: TelegramApi.Message | null = null;

    return setInterval(async () => {
        const orders = await getOrders(cookie);
        const isNotViewedAndNotSendedOrdersCount = orders.filter(
            (order) => order.isViewed === false && !user.sendedOrdersIds.includes(order.id)
        ).length;

        checkOutdatedOrders(orders, user);

        console.log(`Количество непросмотренных и неотправленных заказов: ${telegramUsername}`, isNotViewedAndNotSendedOrdersCount);

        if (isNotViewedAndNotSendedOrdersCount > 0) {
            if (timerMessage) {
                await bot.deleteMessage(chatId, timerMessage.message_id);
                timerMessage = null;
            }
            for (const order of orders) {
                if (order.isViewed === false && !user.sendedOrdersIds.includes(order.id)) {
                    user.sendedOrdersIds.push(order.id);
                    await bot.sendMessage(chatId, (await getLink(order.id)) + "\n\n" + order.description, {
                        disable_web_page_preview: true,
                    });
                }
            }
        } else {
            let seconds = 10;
            if (!timerMessage) {
                timerMessage = await bot.sendMessage(chatId, getAutoUpdateText(seconds));
            }

            const autoUpdateTimerId = setInterval(async () => {
                await bot.editMessageText(getAutoUpdateText(--seconds), {
                    chat_id: timerMessage.chat.id,
                    message_id: timerMessage.message_id,
                });
                if (seconds === 0) {
                    clearInterval(autoUpdateTimerId);
                }
            }, 1000);
        }
    }, 10000);
}

function getAutoUpdateText(seconds: number) {
    return `Новых заказов нет, автообновление через ${seconds} с`;
}

function checkOutdatedOrders(orders: Order[], user: User) {
    for (const order of orders) {
        const index = user.sendedOrdersIds.indexOf(order.id);
        if (order.isViewed && index !== -1) {
            user.sendedOrdersIds.splice(index, 1);
        }
    }
}
