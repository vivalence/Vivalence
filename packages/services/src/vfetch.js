import path from "path";
import fetch from "isomorphic-fetch";

export default (params) => {
    // console.log("@services/vfetch ", params);
    return (url, body) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(params.cookie && { Cookie: params.cookie })
            },
            body: JSON.stringify(body)
        };
        const pth = urlJoin(params.basePath || "", url);
        // console.log("@services/vfetch fetch", pth, options);
        const request = fetch(pth, options);

        const ok = async () => {
            try {
                const response = await request;
                const json = await response.json();
                if (json.error || !json.data) throw new Error(json.error || "No data found");
                return json.data;
            } catch (err) {
                throw err;
            }
        };
        const single = async () => {
            const items = await ok();
            if (items[0]) return items[0];
            else throw new Error("No single data found");
        };
        const response = async () => await request;

        return {
            request,
            response,
            ok,
            single
        };
    };
};
