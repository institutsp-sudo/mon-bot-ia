// /api/ingest-pdf.js - Ce fichier sera déployé sur Vercel et exécuté une seule fois

import { GoogleGenAI } from '@google/genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';
import axios from 'axios';

// --- Configuration ---
// Les variables d'environnement sont lues directement depuis Vercel
const INDEX_NAME = process.env.PINECONE_INDEX; 
const PDF_URL = 'https://saintpierre91.org/wp-content/uploads/2024/10/reglement-interieur.pdf'; 
const EMBEDDING_MODEL = 'text-embedding-004'; 
const BATCH_SIZE = 100; 

// Initialisation des services (Gemini et Pinecone s'authentifient via les variables Vercel)
const ai = new GoogleGenAI({}); 
const pinecone = new Pinecone({}); 

// Fonctions d'ingestion (getPdfTextFromUrl et ingestPdf) que nous avons vues précédemment
async function getPdfTextFromUrl(url) { /* ... (votre code) ... */ }
async function ingestPdf() { /* ... (votre code) ... */ } 


// --- Le Handler Next.js ---
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        // Optionnel : Laissez les requêtes GET pour le test
        res.status(200).send("Endpoint d'ingestion. Utilisez POST ou accédez à /api/ingest-pdf?run=true");
        return;
    }

    try {
        await ingestPdf(); // Exécute le processus d'ingestion
        res.status(200).json({ success: true, message: 'Ingestion du PDF terminée avec succès !' });
    } catch (error) {
        console.error('Erreur Critique lors de l\'ingestion :', error);
        res.status(500).json({ success: false, message: 'Erreur lors de l\'ingestion. Vérifiez les logs Vercel.' });
    }
}
