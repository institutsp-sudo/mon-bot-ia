// /api/ingest-pdf.js (TEST G : FORCER L'HÔTE PINE CONE)

import { Pinecone } from '@pinecone-database/pinecone';

// REMPLACER PAR VOTRE VRAI HOST.
const PINECONE_HOST = 'https://mon-bot-kb-jgjvrqe.svc.aped-4627-b74a.pinecone.io';
const INDEX_NAME = 'mon-bot-kb'; // Remplacer par le nom de votre index

// --- Initialisation des services ---
const pinecone = new Pinecone({}); // Utilisez la variable pour l'API Key

async function ingestPdf() {
    console.log("[TEST G] Démarrage du test Pinecone par HOST.");
    
    try {
        // Nouvelle méthode d'initialisation forçant l'utilisation de l'URL d'hôte
        const index = new Index(pinecone, INDEX_NAME, PINECONE_HOST); 

        // Tentative de récupérer les stats pour forcer une communication réseau
        await index.describeIndexStats(); 
        console.log("✅ TEST G (Pinecone) : Statut de l'index récupéré par Host.");

    } catch (e) {
        console.error("❌ ERREUR FATALE PINE CONE (TEST G) :", e.message);
        throw new Error('Échec de la connexion/clé Pinecone (Test G): ' + e.message);
    }
}

// NOTE: Vous devrez peut-être ajouter une classe Index pour que cela fonctionne
// Si vous ne voulez pas modifier votre structure, nous allons faire un test plus simple.
// 
// Méthode de Test G Simplifiée : Tenter la connexion avec une API Key vide (qui devrait échouer immédiatement, non silencieusement)

async function ingestPdf() {
    console.log("[TEST G - Simplifié] Test de la réjection de clé.");
    
    // Test forçant la réjection immédiate si la clé est la seule source du problème
    try {
        const pineconeTest = new Pinecone({ apiKey: 'FAUSSE_CLE_TEST_POUR_ERREUR' });
        const index = pineconeTest.Index(INDEX_NAME);
        await index.describeIndexStats(); 
        
    } catch (e) {
        // Ce bloc devrait être atteint IMMÉDIATEMENT si c'est une erreur d'AUTH.
        // Si le silence persiste, l'erreur n'est PAS l'authentification.
        console.log("Le silence persiste. L'erreur est sur la dépendance ou le réseau.");
    }
    throw new Error("Arrêt du test.");
}
// Le reste du handler reste le même.
