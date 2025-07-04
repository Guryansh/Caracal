const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 3000;

let matches = [];

// Load CSV into memory as-is
fs.createReadStream('wimbledon.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Ensure correct types
    matches.push({
      year: parseInt(row.year),
      champion: row.champion,
      runner_up: row.runner_up,
      score: row.score,
      sets: parseInt(row.sets),
      tiebreak: row.tiebreak === 'true' || row.tiebreak === 'TRUE'
    });
  })
  .on('end', () => {
    console.log('CSV data loaded.');
  });

// API Endpoint
app.get('/wimbledon', (req, res) => {
  const year = parseInt(req.query.year);
  if (!year) {
    return res.status(400).json({ error: 'Query param `year` is required' });
  }

  const match = matches.find(m => m.year === year);
  if (!match) {
    return res.status(404).json({ error: 'Match not found for given year' });
  }

  res.json(match);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
