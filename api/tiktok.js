const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: 'URL TikTok wajib diisi' });

  try {
    const tikwm = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
    if (tikwm.data?.code === 0 && tikwm.data.data) {
      const d = tikwm.data.data;
      return res.json({
        status: true, title: d.title,
        author: d.author?.unique_id || d.author?.nickname,
        cover: d.cover, duration: d.duration, music: d.music,
        play: d.play, hd: d.hdplay || d.play, wm: d.wmplay,
        images: d.images || null, source: 'tikwm'
      });
    }
    const snap = await axios.post(
      'https://ssstik.io/abc?url=dl',
      new URLSearchParams({ id: url, locale: 'en', tt: 'dummy' }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'Mozilla/5.0' } }
    );
    const match = snap.data.match(/href="(https:\/\/[^"]+\.mp4[^"]*)"/);
    if (match) return res.json({ status: true, play: match[1], hd: match[1], source: 'ssstik' });
    return res.status(404).json({ status: false, message: 'Gagal mengekstrak video' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
