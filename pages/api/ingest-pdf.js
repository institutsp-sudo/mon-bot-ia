// /api/ingest-pdf.js (CODE FINAL D'INGESTION)

import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import axios from 'axios';

// --- Configuration et Variables d'Environnement (Lues par Vercel) ---
const INDEX_NAME = process.env.PINECONE_INDEX; 
const PDF_URL = 'https://saintpierre91.org/wp-content/uploads/2024/10/reglement-interieur.pdf'; 
const EMBEDDING_MODEL = 'text-embedding-004'; 
const BATCH_SIZE = 100; 

// Initialisation des services
const ai = new GoogleGenAI({}); 
const pinecone = new Pinecone({}); 

// --- Fonctions d'Ingestion ---

async function getPdfTextFromUrl(url) {
    console.log(`[INGEST] Téléchargement et lecture de ${url}...`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);
    const data = await pdf(dataBuffer);
    return data.text;
}

async function ingestPdf() {
    console.log("[INGEST] Processus d'ingestion démarré.");
    
    const fullText = await getPdfTextFromUrl(PDF_URL);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200, 
    });
    const docs = await splitter.createDocuments([fullText]);
    console.log(`[INGEST] PDF divisé en ${docs.length} morceaux.`);
    
    const index = pinecone.Index(INDEX_NAME);
    
    console.log('[INGEST] Création des embeddings Gemini et insertion dans Pinecone en cours...');

    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
        const batch = docs.slice(i, i + BATCH_SIZE);
        const batchText = batch.map(doc => doc.pageContent);

        const embeddingResponse = await ai.models.batchEmbedContents({
            model: EMBEDDING_MODEL,
            requests: batchText.map(text => ({ content: text })),
        });
        const vectors = embeddingResponse.embeddings.map(e => e.values);

        const upsertData = vectors.map((vector, idx) => ({
            id: `pdf-chunk-${i + idx}-${Date.now()}`,
            values: vector,
            metadata: { text: batch[idx].pageContent, source: PDF_URL },
        }));

        await index.upsert({ vectors: upsertData });
        console.log(`[INGEST] Lot ${i / BATCH_SIZE + 1} / ${Math.ceil(docs.length / BATCH_SIZE)} inséré.`);
    }

    console.log('✅ [INGEST] Ingestion du PDF terminée avec succès !');
}


// --- Le Handler Next.js / Vercel ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Méthode non autorisée. Utilisez POST.' });
        return;
    }

    try {
        await ingestPdf(); // Exécute le processus d'ingestion
        res.status(200).json({ success: true, message: 'Ingestion du PDF terminée avec succès. Votre KB est prête.' });
    } catch (error) {
        // En cas d'erreur ici, cela provient d'une erreur d'API (Pinecone, Gemini, Axios)
        console.error('❌ Erreur Critique lors de l\'ingestion (Vercel Logs):', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ingestion. Problème de clé/connexion Pinecone ou Gemini.' });
    }
}
