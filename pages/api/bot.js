export default function handler(req, res) {
  if (req.method === 'POST') {
    const query = req.body.query?.toLowerCase().trim() || '';

    const kb = {
      'annuler': 'Annulez en 24h via votre compte.',
      'livraison': '48h en France métropolitaine.',
      'retour': 'Retour gratuit sous 14 jours.',
      'prix': 'Prix TTC, livraison incluse.',
      'bonjour': 'Bonjour ! Comment puis-je vous aider ?'
    };

    const reply = kb[query] || `Je ne sais pas pour "${query}". Un conseiller vous répondra sous 24h.`;
    res.status(200).json({ reply });
  } else {
    res.status(200).json({ message: 'Bot IA live ! POST /api/bot' });
  }
}
