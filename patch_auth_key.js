const fs = require('fs');
let code = fs.readFileSync('Backend/routes/auth.js', 'utf8');

const newRoute = `
router.post("/verify-site-key", (req, res) => {
  const { key } = req.body;
  const validKey = process.env.SITE_ACCESS_KEY || "SIH2026-WIN";
  if (key === validKey) {
    res.json({ success: true, message: "Access granted" });
  } else {
    res.status(401).json({ success: false, message: "Invalid security key" });
  }
});
`;

code = code.replace('module.exports = router;', newRoute + '\nmodule.exports = router;');
fs.writeFileSync('Backend/routes/auth.js', code);
console.log("Added verify route");
