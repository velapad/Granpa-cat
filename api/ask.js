const { sysChat, sysCat, SYS_PERSONA, limited, originOk, send, readBody, clientIp } = require("./_lib");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return send(res, { code: "method" }, 405);
  if (!originOk(req)) return send(res, { code: "forbidden" }, 403);
  if (await limited("rl:ask:" + clientIp(req), 20, 600)) return send(res, { code: "rate_limited" }, 429);
  const b = readBody(req);
  if (!b) return send(res, { code: "bad_request" }, 400);
  const mode = b.mode === "persona" ? "persona" : b.mode === "cat" ? "cat" : "chat";
  const text = String(b.text || "").slice(0, mode === "persona" ? 400 : 2500).trim();
  if (!text) return send(res, { code: "bad_request" }, 400);
  let system = mode === "chat" ? sysChat(process.env) : SYS_PERSONA, user = text;
  if (mode === "chat") user = "Conversation so far:\n" + text + "\n\nReply as Granpa now (reply text only, no name prefix).";
  if (mode === "cat") {
    const name = String(b.name || "").replace(/[<>\n]/g, " ").trim().slice(0, 30);
    const sym = String(b.sym || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
    const persona = String(b.persona || "").replace(/<\/?persona>/gi, "").trim().slice(0, 400);
    if (name.length < 2 || sym.length < 2 || persona.length < 10) return send(res, { code: "bad_request" }, 400);
    system = sysCat(name, sym, persona);
    user = "Conversation so far:\n" + text + "\n\nReply as " + name + " now (reply text only, no name prefix).";
  }
  if (!process.env.ANTHROPIC_API_KEY) return send(res, { code: "upstream" }, 502);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-haiku-5-5",
        max_tokens: 300,
        system,
        messages: [{ role: "user", content: user }]
      })
    });
    if (!r.ok) return send(res, { code: "upstream" }, 502);
    const d = await r.json();
    const out = (d.content || []).filter(c => c.type === "text").map(c => c.text).join("").trim();
    return send(res, { text: out });
  } catch (e) {
    return send(res, { code: "upstream" }, 502);
  }
};
