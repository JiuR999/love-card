console.log("GITHUB_TOKEN:", process.env.GITHUB_TOKEN);
console.log("GITHUB_REPO:", process.env.GITHUB_REPO);
export default async function handler(req, res) {
    const token = process.env.GITHUB_TOKEN;

    console.log(token);

    if (!token) {
        return res.status(500).json({ error: "Missing GITHUB_TOKEN in server environment" });
    }

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const path = process.env.GITHUB_PATH;

    if (!owner || !repo || !path) {
        return res.status(500).json({
            error: "Missing GITHUB_OWNER / GITHUB_REPO / GITHUB_PATH in server environment",
        });
    }

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    try {
        if (req.method === "GET") {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                },
            });

            if (!response.ok) {
                const text = await response.text();
                return res.status(response.status).json({
                    error: "Failed to fetch file from GitHub",
                    details: text,
                });
            }

            const data = await response.json();

            const decoded = Buffer.from(data.content, "base64").toString("utf8");
            const content = JSON.parse(decoded);

            return res.status(200).json(content);
        }

        if (req.method === "POST") {
            const { config, cardData } = req.body || {};

            const fullPayload = {
                config,
                cardData,
                lastUpdated: new Date().toISOString(),
            };

            let sha = "";

            const getFileRes = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                },
            });

            if (getFileRes.ok) {
                const fileData = await getFileRes.json();
                sha = fileData.sha;
            }

            const contentBase64 = Buffer.from(
                JSON.stringify(fullPayload, null, 2),
                "utf8"
            ).toString("base64");

            const putResponse = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github+json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: `Update love-card data: ${new Date().toLocaleString("zh-CN")}`,
                    content: contentBase64,
                    ...(sha ? { sha } : {}),
                }),
            });

            if (!putResponse.ok) {
                const text = await putResponse.text();
                return res.status(putResponse.status).json({
                    error: "Failed to sync file to GitHub",
                    details: text,
                });
            }

            const result = await putResponse.json();
            return res.status(200).json({
                success: true,
                message: "Synced to GitHub successfully",
                result,
            });
        }

        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        return res.status(500).json({
            error: "Server error",
            details: error.message,
        });
    }
}