const { RESERVED, redis, redisCfg, limited, originOk, send, readBody, clientIp } = require("./_lib");

// Kucing komunitas: hanya profil (tanpa token). Disimpan di Upstash Redis (list "cats:list", set simbol "cats:syms").
module.exports = async function handler(req, res) {
  if (!redisCfg()) return send(res, { code: "unavailable" }, 503);
  try {
    if (req.method === "GET") {
      const rows = (await redis(["LRANGE", "cats:list", "0", "-1"])) || [];
      const cats = [];
      rows.forEach(r => { try { cats.push(JSON.parse(r)); } catch (e) {} });
      return send(res, { cats });
    }
    if (req.method !== "POST") return send(res, { code: "method" }, 405);
    if (!originOk(req)) return send(res, { code: "forbidden" }, 403);
    if (await limited("rl:cat:" + clientIp(req), 3, 3600)) return send(res, { code: "rate_limited" }, 429);
    const b = readBody(req);
    if (!b) return send(res, { code: "bad_request" }, 400);
    const n = String(b.n || "").trim().slice(0, 30);
    const y = String(b.y || "").trim().toUpperCase();
    const d = String(b.d || "").trim().slice(0, 400);
    if (n.length < 2 || !/^[A-Z]{2,8}$/.test(y) || d.length < 10) return send(res, { code: "bad_request" }, 400);
    const g = Math.max(0, Math.min(4, parseInt(b.g, 10) || 0));
    const p = Number.isInteger(b.p) ? b.p : null;
    if (RESERVED.includes(y)) return send(res, { code: "taken" }, 409);
    if ((await redis(["LLEN", "cats:list"])) >= 500) return send(res, { code: "full" }, 429);
    if ((await redis(["SADD", "cats:syms", y])) === 0) return send(res, { code: "taken" }, 409);
    const cat = { id: 1000 + Math.floor(Math.random() * 1e9), n, y, g, p, d, t: Date.now() };
    await redis(["RPUSH", "cats:list", JSON.stringify(cat)]);
    return send(res, { cat });
  } catch (e) {
    return send(res, { code: "error" }, 500);
  }
};
