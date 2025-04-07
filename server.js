const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const port = 3001;

app.use(bodyParser.json());

app.post("/api/submit-intake", (req, res) => {
  const data = req.body;
  const timestamp = Date.now();
  const filename = `intake-submissions/${data.projectName
    .toLowerCase()
    .replace(/\s/g, "-")}-${timestamp}.json`;

  fs.writeFileSync(filename, JSON.stringify(data, null, 2));

  console.log(`✅ Intake data saved: ${filename}`);

  exec(
    `node scripts/generate-brief.js '${filename}'`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Brief generation error: ${stderr}`);
        return res.status(500).send("Error generating project brief.");
      }
      console.log(stdout);
      res.status(200).send("✅ Project brief generated!");
    }
  );
});

app.listen(port, () => {
  console.log(`🚀 Intake server running on http://localhost:${port}`);
});
