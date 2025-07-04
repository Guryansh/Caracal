const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

let matches = [];

const loadCSV = () => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(path.join(__dirname, '..', 'wimbledon.csv'))
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          year: parseInt(row.year),
          champion: row.champion,
          runner_up: row.runner_up,
          score: row.score,
          sets: parseInt(row.sets),
          tiebreak: row.tiebreak === 'true' || row.tiebreak === 'TRUE'
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

module.exports = async (req, res) => {
  const { year } = req.query;

  if (!year) {
    return res.status(400).json({ error: 'Query param `year` is required' });
  }

  if (matches.length === 0) {
    matches = await loadCSV();
  }

  const match = matches.find((m) => m.year === parseInt(year));
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }

  res.status(200).json(match);
};
