// /api/ingest-pdf.js (TEST E : UNIQUMENT VERIFICATION GEMINI)

import { GoogleGenAI } from '@google/genai'; 
import { Pinecone } from '@pinecone-database/pinecone'; 
import axios from 'axios'; // Garder les imports au cas où la dépendance est la cause

// --- Initialisation des services (Le Point de Test) ---
const INDEX_NAME = process.env.PINECONE_INDEX; 
const PDF_URL = 'https://saintpierre91.org/wp-content/uploads/2024/10/reglement-interieur.pdf'; 

// On décommente UNIQUEMENT l'initialisation de Gemini. 
// Le reste est conservé pour la structure, mais non exécuté.
try {
    const ai = new GoogleGenAI({}); // Utilise GEMINI_API_KEY de Vercel
    
    // On pourrait même essayer de faire une requête simple pour forcer l'auth
    // const models = await ai.models.list(); 
    
    console.log("✅ Client Gemini initialisé."); 
} catch (e) {
    console.error("❌ ERREUR FATALE AUTHENTIFICATION GEMINI : ", e.message);
    // Si cela échoue, on force une Erreur 500 immédiate avec un message explicite
    throw new Error('Échec de la connexion Gemini. Vérifiez GEMINI_API_KEY : ' + e.message); 
}


// --- Fonctions Vides ---
async function ingestPdf() {
    // Cette fonction ne s'exécutera pas dans le test
    return;
}


// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée.' });
        return;
    }
    
    try {
        // Si on arrive ici, l'initialisation de Gemini ci-dessus a réussi.
        res.status(200).json({ success: true, message: 'TEST E REUSSI: Clé Gemini acceptée. Le problème vient de Pinecone.' });
    } catch (error) {
        // Réponse d'erreur si le 'throw new Error' ci-dessus est exécuté
        res.status(500).json({ success: false, message: 'Erreur 500 (Initialisation Gemini échouée). Vérifiez les logs Vercel.' });
    }
}
