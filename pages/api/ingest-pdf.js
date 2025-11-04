// /api/ingest-pdf.js (TEST A : Le plus simple possible)

// IMPORT EZ
import axios from 'axios'; // On garde juste axios pour le test, il est peu probable de causer l'erreur

// --- Configuration et Initialisation ---
// COMMENTEZ TOUT LE RESTE ICI : Pinecone, Gemini, PDF_URL, etc.
// Laissez les constantes pour ne pas casser le code si vous le décommentez
const INDEX_NAME = process.env.PINECONE_INDEX; 

// --- Fonction IngestPdf ---
// COMMENTEZ TOUT LE CONTENU DE CETTE FONCTION POUR LE TEST A
async function ingestPdf() {
    // Ne rien faire pour l'instant
    return;
}

// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée.' });
        return;
    }
    
    try {
        // COMMENTEZ CET APPEL: await ingestPdf(); 
        
        // Nouvelle réponse de débug: Si on arrive ici, l'erreur 500 n'est pas le handler lui-même
        res.status(200).json({ success: true, message: 'TEST A REUSSI: La fonction s\'exécute !' });
    } catch (error) {
        // Si on obtient quand même une erreur 500, le problème est très profond (Node.js ou Vercel Build)
        console.error('Erreur Inattendue dans le Handler:', error);
        res.status(500).json({ success: false, message: 'ERREUR 500 PERSISTANTE. Problème de build.' });
    }
}
