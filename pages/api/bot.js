export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const query = req.body.query?.toLowerCase().trim() || '';
    const kb = {
      'casquette': 'Oui, les casquettes sont autorisées à l’école !',
      'formations': 'Nos formations : Bac Pro, CAP, BTS Commerce, Informatique, etc.',
      'bonjour': 'Bonjour ! Je suis Pierre, votre assistant.'
    };
    const reply = kb[query] || `Désolé, je ne sais pas pour "${query}". Un conseiller vous répondra sous 24h.`;
    res.status(200).json({ reply });
  } else {
    res.status(200).json({ message: 'Bot IA live ! POST /api/bot' });
  }
}
