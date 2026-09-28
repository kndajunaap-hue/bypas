const axios = require('axios');

const PLAYLIST = [
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_2b1e2f9c1a.mp3',
  'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3',
  'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc2c08e.mp3',
  'https://cdn.pixabay.com/download/audio/2021/11/25/audio_00fa5593f3.mp3'
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const pick = PLAYLIST[Math.floor(Math.random() * PLAYLIST.length)];
  return res.json({ status: true, url: pick, total: PLAYLIST.length, pick: PLAYLIST.indexOf(pick) + 1 });
};
