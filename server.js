const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// The directory where your files are stored.
// For this example, create a folder named 'files' in the same directory as server.js
const filesDirectory = path.join(__dirname, "files");

// This route handles requests for files
app.get("/:filename", (req, res) => {
  const { filename } = req.params;

  // IMPORTANT: Sanitize the filename to prevent directory traversal attacks
  // This regex ensures the filename only contains letters, numbers, dots, and underscores
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "");

  if (safeFilename !== filename) {
    console.warn(`Attempted access with unsafe filename: ${filename}`);
    return res.status(403).send("Forbidden: Invalid filename.");
  }

  const filePath = path.join(filesDirectory, safeFilename);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found
      console.error(`File not found: ${filePath}`);
      return res.status(404).send("File not found.");
    }

    // Use res.download() to trigger a file download
    // This automatically sets the 'Content-Disposition: attachment' header
    res.download(filePath, (downloadErr) => {
      if (downloadErr) {
        // Handle errors that might occur during the send process
        console.error("Error sending file:", downloadErr);
        // Don't send a 404 here, as the file was found but failed to send
        // The headers might already be sent
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
  // Create the 'files' directory if it doesn't exist
  if (!fs.existsSync(filesDirectory)) {
    fs.mkdirSync(filesDirectory);
    console.log(`Created 'files' directory.`);
  }
});
