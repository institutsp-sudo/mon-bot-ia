// /api/ingest-pdf.js

import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import axios from 'axios';

// --- Configuration et Variables d'Environnement (Lues par Vercel) ---
// Ces variables doivent être configurées dans les paramètres de votre projet Vercel
const INDEX_NAME = process.env.PINECONE_INDEX; 
const PDF_URL = 'https://saintpierre91.org/wp-content/uploads/2024/10/reglement-interieur.pdf'; 
const EMBEDDING_MODEL = 'text-embedding-004'; 
const BATCH_SIZE = 100; 

// Initialisation des services
const ai = new GoogleGenAI({}); 
const pinecone = new Pinecone({}); 

// --- Fonctions d'Ingestion ---

/**
 * Télécharge et lit le contenu texte du PDF depuis l'URL.
 */
async function getPdfTextFromUrl(url) {
    console.log(`[INGEST] Démarrage du téléchargement et de la lecture de ${url}...`);
    
    // Téléchargement du fichier en tant que Buffer
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);
    
    // Parsing du Buffer avec pdf-parse
    const data = await pdf(dataBuffer);
    return data.text;
}

/**
 * Découpe le texte en morceaux, les vectorise via Gemini et insère dans Pinecone.
 */
async function ingestPdf() {
    console.log("[INGEST] Processus d'ingestion démarré.");
    
    const fullText = await getPdfTextFromUrl(PDF_URL);

    // Découpage du texte pour la vectorisation
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200, 
    });
    const docs = await splitter.createDocuments([fullText]);
    console.log(`[INGEST] PDF divisé en ${docs.length} morceaux (chunks).`);
    
    const index = pinecone.Index(INDEX_NAME);
    
    console.log('[INGEST] Création des embeddings Gemini et insertion dans Pinecone en cours...');

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);
        const batchText = batch.map(doc => doc.pageContent);

        // Appel de l'API Gemini pour la vectorisation
        const embeddingResponse = await ai.models.batchEmbedContents({
            model: EMBEDDING_MODEL,
            requests: batchText.map(text => ({ content: text })),
        });
        const vectors = embeddingResponse.embeddings.map(e => e.values);

        // Préparation des données pour Pinecone
        const upsertData = vectors.map((vector, idx) => ({
            id: `pdf-chunk-${i + idx}-${Date.now()}`,
            values: vector,
            metadata: { text: batch[idx].pageContent, source: PDF_URL },
        }));

        // Insertion dans Pinecone
        await index.upsert({ vectors: upsertData });
        console.log(`[INGEST] Lot ${i / BATCH_SIZE + 1} / ${Math.ceil(docs.length / BATCH_SIZE)} inséré.`);
    }

    console.log('✅ [INGEST] Ingestion du PDF terminée avec succès !');
}


// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    // Mesure de sécurité simple : n'accepter que les requêtes POST
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée. Utilisez la méthode POST pour lancer l\'ingestion.' });
        return;
    }

    // Sécurité : Vérifiez ici un token secret si ce n'est pas une route publique
    // if (req.headers['x-secret-token'] !== process.env.INGEST_SECRET) { /* ... */ }

    try {
        await ingestPdf(); // Exécute le processus d'ingestion
        res.status(200).json({ success: true, message: 'Ingestion du PDF terminée. Votre Base de Connaissance est à jour.' });
    } catch (error) {
        console.error('❌ Erreur Critique lors de l\'ingestion (Vercel Logs):', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ingestion. Vérifiez les logs Vercel pour le détail.' });
    }
}
