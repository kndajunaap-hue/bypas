const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: 'URL wajib diisi' });

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8'
      },
      maxRedirects: 5, timeout: 15000
    });

    const finalUrl = response.request?.res?.responseUrl || url;
    const $ = cheerio.load(response.data);
    const metaRefresh = $('meta[http-equiv="refresh"]').attr('content');
    let metaUrl = null;
    if (metaRefresh) { const m = metaRefresh.match(/url=(.+)/i); if (m) metaUrl = m[1]; }

    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href'); const text = $(el).text().trim();
      if (href && !href.startsWith('#') && !href.startsWith('javascript')) links.push({ text, href });
    });
    const forms = [];
    $('form').each((i, el) => {
      forms.push({
        action: $(el).attr('action'), method: $(el).attr('method') || 'GET',
        inputs: $(el).find('input').map((j, inp) => ({ name: $(inp).attr('name'), value: $(inp).attr('value') })).get()
      });
    });

    return res.json({
      status: true, original: url, final: finalUrl, metaRefresh: metaUrl,
      links: links.slice(0, 50), forms: forms.slice(0, 10), title: $('title').text()
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
