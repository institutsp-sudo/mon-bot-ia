export default function handler(req, res) {
  // AJOUT CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gère le preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const query = req.body.query?.toLowerCase().trim() || '';
    const kb = {
      'annuler': 'Annulez en 24h via votre compte.',
      'livraison': '48h en France métropolitaine.',
      'retour': 'Retour gratuit sous 14 jours.',
      'casquette': 'Oui, les casquettes sont autorisées à l’école !',
      'formations': 'Nos formations : Bac Pro, CAP, BTS Commerce, Informatique, et plus.',
      'bonjour': 'Bonjour ! Je suis Pierre, votre assistant.'
    };
    const reply = kb[query] || `Désolé, je ne sais pas pour "${query}". Un conseiller vous répondra sous 24h.`;
    res.status(200).json({ reply });
  } else {
    res.status(200).json({ message: 'Bot IA live ! POST /api/bot' });
  }
}
