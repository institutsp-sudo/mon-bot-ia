// /api/ingest-pdf.js (TEST F : UNIQUEMENT CONNEXION PINE CONE)

import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';

// --- Initialisation des services ---
const INDEX_NAME = process.env.PINECONE_INDEX; 

// Initialisation simple de Gemini et Pinecone.
const ai = new GoogleGenAI({}); 
const pinecone = new Pinecone({}); 

// --- Fonction Vides pour ce test ---
async function getPdfTextFromUrl(url) { return "texte test"; }
async function ingestPdf() {
    console.log("[TEST F] Démarrage du test Pinecone.");
    
    // Tentative d'accès à l'index pour vérifier la clé Pinecone
    try {
        const index = pinecone.Index(INDEX_NAME);
        // On essaie de récupérer les stats pour forcer une communication réseau rapide
        await index.describeIndexStats(); 
        console.log("✅ TEST F (Pinecone) : Statut de l'index récupéré.");
    } catch (e) {
        console.error("❌ ERREUR FATALE PINE CONE (TEST F) :", e.message);
        // On relance l'erreur pour la capturer et éviter le silence.
        throw new Error('Échec de la connexion/clé Pinecone: ' + e.message);
    }
}


// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée.' });
        return;
    }

    try {
        await ingestPdf(); 
        res.status(200).json({ success: true, message: 'TEST F REUSSI: Clés et connexion Pinecone OK.' });
    } catch (error) {
        // Cette erreur est catchée si l'appel describeIndexStats a planté
        res.status(500).json({ success: false, message: 'Erreur 500 (Problème de clé/connexion Pinecone).' });
    }
}
