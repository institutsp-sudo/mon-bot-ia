// /api/ingest-pdf.js (TEST D : Vérification stricte de l'environnement Pinecone)

import { Pinecone } from '@pinecone-database/pinecone'; 
import { GoogleGenAI } from '@google/genai'; // Laisser importé
// ... (autres imports)

// --- Initialisation des services ---
const INDEX_NAME = process.env.PINECONE_INDEX; 

try {
    // 1. Initialisation simple de Pinecone
    const pinecone = new Pinecone({}); 
    
    // Test : Tentative d'accès à l'index pour vérifier que l'environnement existe.
    // Cette ligne peut échouer si PINECONE_ENVIRONMENT ou PINECONE_API_KEY est incorrect.
    const kbIndex = pinecone.Index(INDEX_NAME); 
    
    // Le reste de la logique d'authentification est enlevée pour le moment.
    
} catch (e) {
    // Si une erreur se produit ici (clé invalide, index non trouvé), on la capture
    console.error("❌ ERREUR D'INITIALISATION PINE CONE : ", e.message);
    throw new Error('Échec de la connexion Pinecone: ' + e.message); 
}


// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée.' });
        return;
    }
    
    try {
        // Si on arrive ici, l'initialisation de Pinecone a réussi le premier filtre.
        res.status(200).json({ success: true, message: 'TEST D REUSSI: Connexion Pinecone établie. Passage à Gemini.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur 500 (Initialisation Pinecone échouée). Vérifiez les logs Vercel.' });
    }
}
