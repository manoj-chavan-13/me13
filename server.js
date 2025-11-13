const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// The directory where your files are stored.
const filesDirectory = path.join(__dirname, "files");

// ✅ Root route — shows a simple blank page with centered text
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Security Error</title>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            background-color: #fff;
          }
          h2 {
            color: #000;
            font-weight: normal;
          }
        </style>
      </head>
      <body>
        <h2>Security Error... Are you in trouble?</h2>
      </body>
    </html>
  `);
});

// Route to handle file download
app.get("/:filename", (req, res) => {
  const { filename } = req.params;

  // Sanitize filename
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");

  if (safeFilename !== filename) {
    console.warn(`Attempted access with unsafe filename: ${filename}`);
    return res.status(403).send("Forbidden: Invalid filename.");
  }

  const filePath = path.join(filesDirectory, safeFilename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).send("File not found.");
    }

    res.download(filePath, (downloadErr) => {
      if (downloadErr) {
        console.error("Error sending file:", downloadErr);
        if (!res.headersSent) {
          res.status(500).send("Error downloading file.");
        }
      }
    });
  });
});

app.listen(port, () => {
  console.log(`File download server running at http://localhost:${port}`);
  console.log(`Place files to serve in this directory: ${filesDirectory}`);

  if (!fs.existsSync(filesDirectory)) {
    fs.mkdirSync(filesDirectory);
    console.log(`Created 'files' directory.`);
  }
});
