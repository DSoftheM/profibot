export function getHeaders(cookie: string) {
    return {
        accept: "application/json",
        "accept-language": "ru,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryHagWMxTwQ9h1Fjwm",
        "sec-ch-ua": '"Not.A/Brand";v="8", "Chromium";v="114", "Microsoft Edge";v="114"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-app-id": "BO",
        "x-new-auth-compatible": "1",
        cookie,
        Referer: "https://profi.ru/backoffice/n.php",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    };
}
