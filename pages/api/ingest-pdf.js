// /api/ingest-pdf.js (TEST C : Test de l'initialisation Gemini)

import { Pinecone } from '@pinecone-database/pinecone'; 
import { GoogleGenAI } from '@google/genai'; // NOUVEAU

// ... (autres imports)

// --- Initialisation des services ---
const INDEX_NAME = process.env.PINECONE_INDEX; 

try {
    // 1. Initialisation simple de Pinecone (ne force pas d'appel réseau)
    const pinecone = new Pinecone({}); 
    const kbIndex = pinecone.Index(INDEX_NAME); 
    // Ligne problématique RETIRÉE : // await kbIndex.describeIndexStats(); 

    // 2. Initialisation simple de Gemini (vérifie GEMINI_API_KEY)
    const ai = new GoogleGenAI({}); // NOUVEAU
    
    console.log("✅ Connexion OK.");

} catch (e) {
    // Si une erreur se produit ici, c'est une erreur 500
    console.error("❌ ERREUR AUTHENTIFICATION:", e);
    throw new Error('Échec de l\'initialisation des clients API: ' + e.message); 
}


// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    // ... (logic 405) ...
    
    try {
        // Si on arrive ici, l'initialisation n'a pas planté
        res.status(200).json({ success: true, message: 'TEST C REUSSI: Les clés Gemini et Pinecone sont acceptées par le code.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur 500 (Problème de clé/connexion).' });
    }
}
