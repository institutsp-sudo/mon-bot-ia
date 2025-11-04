// /api/ingest-pdf.js (TEST B : Test de l'initialisation Pinecone)

import { Pinecone } from '@pinecone-database/pinecone'; // Laissez cet import

// On garde ces imports mais on ne les utilise pas encore
import { GoogleGenAI } from '@google/genai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import axios from 'axios';

// --- Configuration et Initialisation (Concentration sur Pinecone) ---
const INDEX_NAME = process.env.PINECONE_INDEX; 
const PDF_URL = 'https://saintpierre91.org/wp-content/uploads/2024/10/reglement-interieur.pdf'; 

// Tentative d'initialisation de Pinecone (vérifie PINECONE_API_KEY et PINECONE_ENVIRONMENT)
try {
    const pinecone = new Pinecone({}); // Initialisation via les variables Vercel
    const kbIndex = pinecone.Index(INDEX_NAME); // Vérifie le nom de l'index
    
    // Tentative de récupérer les statistiques pour forcer l'appel à l'API de Pinecone
    await kbIndex.describeIndexStats(); 
    
    console.log("✅ TEST B REUSSI: Connexion Pinecone OK.");

} catch (e) {
    // Si une erreur se produit ici (clé invalide, index non trouvé), on la capture
    console.error("❌ ERREUR PINE CONE: Vérifiez vos variables PINECONE_* sur Vercel.", e);
    // On relance l'erreur pour qu'elle puisse être vue dans le log Vercel 
    // et cause une erreur 500 si elle est fatale, comme c'est le cas ici
    throw new Error('Échec de la connexion Pinecone: ' + e.message); 
}


// --- Fonctions d'Ingestion Vides (pour le test) ---
async function ingestPdf() {
    return;
}

// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée.' });
        return;
    }
    
    try {
        // La ligne critique est l'initialisation de Pinecone au-dessus du handler
        
        res.status(200).json({ success: true, message: 'TEST B REUSSI: Clés Pinecone valides.' });
    } catch (error) {
        // Cette erreur est catchée si le throw ci-dessus s'est produit
        res.status(500).json({ success: false, message: 'Erreur 500 (Authentification Pinecone échouée). Voir les logs Vercel.' });
    }
}
