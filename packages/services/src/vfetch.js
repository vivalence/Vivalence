// import path from "path";
import urlJoin from "url-join";
import cfetch from "cross-fetch";

const vfetch = (requestParams) => {
    return (url, body) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // ...(!!requestParams.cookie && { Cookie: requestParams.cookie }),
                ...(!!requestParams.session && {
                    Authorization: `Bearer ${JSON.stringify(requestParams.session)}`
                })
            },
            body: JSON.stringify(body),
            credentials: "include"
        };

        const pth = urlJoin(requestParams.basePath, url);
        // console.log("fetch", pth, options);
        const request = (requestParams.fetch || cfetch)(pth, options);

        const ok = async () => {
            try {
                const response = await request;
                const json = await response.json();
                if (json.error || !json.data) throw new Error(json.error || "No data found");
                return json.data;
            } catch (err) {
                console.error("[ONTOLOGY FETCH ERROR]");
                console.error(err);
                console.error(requestParams);
                console.error(url, options);
                console.error("[/ONTOLOGY FETCH ERROR]");
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

export default vfetch;
