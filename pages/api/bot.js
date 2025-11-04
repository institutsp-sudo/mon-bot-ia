// pages/api/bot.js
export default function handler(req, res) {
  if (req.method === 'POST') {
    const query = req.body.query?.toLowerCase().trim() || '';

    const kb = {
      'annuler': 'Annulez en 24h via votre compte.',
      'livraison': '48h en France.',
      'retour': 'Retour gratuit sous 14 jours.',
    };

    const reply = kb[query] || `Je ne sais pas pour "${query}". E-mail envoyé à support@tonsite.com`;
    res.status(200).json({ reply });
  } else {
    res.status(200).json({ message: 'Bot live !' });
  }
}
