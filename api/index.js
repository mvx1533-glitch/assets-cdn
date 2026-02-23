const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        // 1. Lecture du registre JSON hébergé sur ton GitHub
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) {
            return res.status(404).send("Erreur : Signal inconnu dans le registre.");
        }

        // 2. Récupération simultanée des deux fragments (A sur GitHub et B sur OVH)
        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        // 3. Fusion des deux fragments en un seul bloc de données
        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        
        // 4. Envoi des instructions au navigateur pour activer le lecteur audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', combined.length);
        res.setHeader('Accept-Ranges', 'bytes');
        
        // 5. Libération du Signal fusionné
        return res.send(combined);

    } catch (e) {
        // Capture des erreurs (404, blocage réseau, etc.)
        return res.status(500).send(`Erreur de synchronisation : ${e.message}`);
    }
}
