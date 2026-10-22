module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({ contract: process.env.CONTRACT || "", url: process.env.LAUNCH_URL || "" }));
};
