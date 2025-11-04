import dialogflow from '@google-cloud/dialogflow';

// L'ID de votre Agent Dialogflow ES
const PROJECT_ID = process.env.DIALOGFLOW_PROJECT_ID; 

// Initialisation du client Dialogflow (s'authentifie via les variables d'environnement)
const sessionClient = new dialogflow.SessionsClient({
    keyFilename: '/tmp/key.json', // Chemin temporaire pour le fichier de clé
});
const LANGUAGE_CODE = 'fr'; // La langue de votre agent

/**
 * Configure les headers CORS pour la fonction Vercel.
 */
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Appelle l'API Dialogflow pour obtenir une réponse.
 */
async function callDialogflow(query, sessionId) {
    const sessionPath = sessionClient.projectAgentSessionPath(PROJECT_ID, sessionId);

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: LANGUAGE_CODE,
            },
        },
    };

    try {
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        if (result.intent) {
            // Si Dialogflow a trouvé un Intent, utilisez sa réponse (Fulfillment Text)
            return result.fulfillmentText;
        } else {
            // Pas d'Intent trouvé par Dialogflow
            return `Désolé, je ne sais pas quoi répondre à "${query}". Un conseiller vous répondra sous 24h.`;
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à Dialogflow:', error);
        return 'Désolé, une erreur technique est survenue.';
    }
}

/**
 * Fonction principale (Handler Vercel)
 */
export default async function handler(req, res) {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(200).json({ message: 'Bot IA live ! POST /api/bot' });
        return;
    }
    
    // --- Logique Hybride ---

    const { query, sessionId } = req.body;
    const userQuery = query?.toLowerCase().trim() || '';

    // 1. BASE DE CONNAISSANCE STATIQUE (Priorité 1)
    const kb = {
        'casquette': 'Oui, les casquettes sont autorisées à l’école !',
        'formations': 'Nos formations : Bac Pro, CAP, BTS Commerce, Informatique, etc.',
        'bonjour': 'Bonjour ! Je suis Pierre, votre assistant.',
        // Ajoutez ici d'autres paires clés-valeurs si nécessaire
    };

    let reply = kb[userQuery];

    if (reply) {
        // Réponse trouvée dans la KB locale
        res.status(200).json({ reply });
        return;
    }

    // 2. DIALOGFLOW ES (Priorité 2)

    // Assurez-vous d'avoir une Session ID pour Dialogflow.
    const session = sessionId || 'default-session-id'; 

    // Appeler Dialogflow si la KB statique n'a rien trouvé
    reply = await callDialogflow(userQuery, session);

    res.status(200).json({ reply });
}

// --- Sauvegarder la clé Dialogflow temporairement pour l'authentification ---
// Cette étape est nécessaire dans l'environnement Serverless de Vercel.
import * as fs from 'fs';
import * as path from 'path';

// Assurez-vous que le dossier /tmp existe
if (!fs.existsSync('/tmp')) {
    fs.mkdirSync('/tmp');
}

// Écrit le contenu de la variable d'environnement dans un fichier temporaire
const keyPath = '/tmp/key.json';
fs.writeFileSync(keyPath, process.env.DIALOGFLOW_PRIVATE_KEY);
