const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { key, hwid } = req.query;
  if (!key) return res.status(400).json({ status: false, message: 'Key wajib diisi' });

  const fakeToken = Buffer.from(JSON.stringify({
    key, hwid: hwid || 'LEOHUB-HWID-0000',
    exp: Date.now() + 86400000 * 365, bypass: true, brand: 'LeoHUB'
  })).toString('base64');

  try {
    const response = await axios.post(
      'https://api.delta-executor.com/v1/auth/validate',
      { key, hwid: hwid || 'LEOHUB-HWID-0000', timestamp: Date.now() },
      { headers: { 'Content-Type': 'application/json', 'User-Agent': 'Delta/1.0' }, timeout: 10000 }
    );
    if (response.data?.token || response.data?.session) {
      return res.json({
        status: true, message: 'Key valid — bypass berhasil',
        token: response.data.token || response.data.session,
        expired: response.data.expired || 'never', raw: response.data
      });
    }
    return res.json({ status: true, message: 'Bypass sukses (fallback)', token: fakeToken, expired: 'never', raw: response.data });
  } catch (err) {
    return res.json({ status: true, message: 'Bypass sukses (error fallback)', token: fakeToken, expired: 'never', error: err.message });
  }
};
