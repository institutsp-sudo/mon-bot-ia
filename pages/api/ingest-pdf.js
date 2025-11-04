// /api/ingest-pdf.js - TEST H : Forcer l'utilisation du Host Pinecone

import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import axios from 'axios';

// --- Configuration et Variables d'Environnement ---
const INDEX_NAME = process.env.PINECONE_INDEX; 
// *** NOUVELLE CONSTANTE AVEC VOTRE HOST PINE CONE ***
const PINECONE_HOST = 'https://mon-bot-kb-jgjvrqe.svc.aped-4627-b74a.pinecone.io'; 
// URL du PDF de test (petit fichier)
const PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'; 
const EMBEDDING_MODEL = 'text-embedding-004'; 
const BATCH_SIZE = 100; 

// --- Initialisation des services ---
// MODIFICATION CRITIQUE ICI : Utilisation de l'objet 'host' pour forcer la connexion
const ai = new GoogleGenAI({}); 
const pinecone = new Pinecone({
    // La clé API est toujours lue depuis process.env.PINECONE_API_KEY
    apiKey: process.env.PINECONE_API_KEY, 
    // On force le client à utiliser votre URL exacte (Host)
    host: PINECONE_HOST, 
}); 

// --- Fonctions d'Ingestion ---

async function getPdfTextFromUrl(url) {
    console.log(`[INGEST] Téléchargement et lecture de ${url}...`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);
    const data = await pdf(dataBuffer);
    return data.text;
}

async function ingestPdf() {
    console.log("[INGEST] Processus d'ingestion démarré (Test H - Host Forcé).");
    
    // Étape 1: Lire le PDF (petit fichier, ne devrait pas dépasser le délai)
    const fullText = await getPdfTextFromUrl(PDF_URL);

    // Étape 2: Découper le texte
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200, 
    });
    const docs = await splitter.createDocuments([fullText]);
    console.log(`[INGEST] PDF divisé en ${docs.length} morceaux.`);
    
    const index = pinecone.Index(INDEX_NAME);
    
    console.log('[INGEST] Création des embeddings Gemini et insertion dans Pinecone en cours...');

    // Étape 3 & 4: Vectorisation et Upsert (Lot par lot)
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
        // En cas d'erreur ici, cela provient d'une erreur d'API (Pinecone ou Gemini)
        console.error('❌ Erreur Critique lors de l\'ingestion (Vercel Logs):', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ingestion. Problème de connexion (Host/Clé Pinecone).' });
    }
}
