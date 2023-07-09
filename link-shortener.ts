import fetch from "node-fetch";

type LinkShortenerResponse = {
    successful: true;
    succes: true;
    message: string;
    link: {
        long_url: string;
        short: string;
        hits: number;
        group: null;
    };
    short_url: string;
    qr: {
        base64: string;
    };
};

export async function short(url: string) {
    return fetch("https://goo.su/frontend-api/convert", {
        headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "ru,en;q=0.9,la;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua": '"Chromium";v="112", "YaBrowser";v="23", "Not:A-Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-csrf-token": "esJNX7VIKt7SIQeBkHIaZOzJcA4QfO3uIpNynisq",
            "x-requested-with": "XMLHttpRequest",
            cookie: "adtech_uid=7255ef7b-29ae-46fb-b026-14cc5644adb8%3Agoo.su; top100_id=t1.6673155.189513276.1688845336905; last_visit=1688863131609%3A%3A1688881131609; t3_sid_6673155=s1.2120052121.1688881131405.1688881131618.2.2; XSRF-TOKEN=eyJpdiI6IkthK0crNkpvNDduYnVIK0JFOU5hcFE9PSIsInZhbHVlIjoiM3VmSm5Pb0JPcHl6OWxqTmREV1diZXh5bGlFU1FtNjNsL0hsUWxlY1FJSXV0SS9sdGVMRDMwaEt6dTF6aFBiS2NHdG5GZy9icUlXeDBYdkZTV0hlMndnbkZvYUlWTTVmcDV0U3JwUVUxb25RdVBkY09ESmJXUUhuQ3hZOVkweEsiLCJtYWMiOiJhNDk5ZTk3NTc2N2Y1OWIyOGVhNzZjZTdiMDQzYzU3OTcyNWRhZWMzMmUzYTJhM2FkMWZmMWRmNjNjNTEwMGMxIiwidGFnIjoiIn0%3D; goosu_session=eyJpdiI6InF6YVBnaEphYWhEWlhRaTdYMmZibmc9PSIsInZhbHVlIjoiN3ljdUhxbnNDMXZDNi9iTk1VYnNHdWxrQ2dKR01DdmUxSThQam1Md3dEcU1aaFd3aEtIZ2o4bDhwVWNvR1NWTExPbDNTTUZhVW1USExjbEN3UXJTTVptbHVyZG1lc3lCSXpDWTBQVUJLZ3JHa1g4WWhDRzRsb0tSRGpySlZXWXAiLCJtYWMiOiJhNmQwN2NmOGZhZDQxNDI4N2I4NzVkNWZmYzQwZmFlY2U4YjYwNmIzMThkYjEzZjAyMmZlZDAyNDExMWYyNTAxIiwidGFnIjoiIn0%3D",
            Referer: "https://goo.su/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
        body: `url=${url}&alias=&is_public=0&password=`,
        method: "POST",
    })
        .then((r) => r.json())
        .then((data: LinkShortenerResponse) => {
            return data.short_url;
        });
}
