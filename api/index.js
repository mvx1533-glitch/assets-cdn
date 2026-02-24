const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    const CLE_SECRET = "6644566"; // Ta clé de décodage (La Coudée)

    try {
        // 1. Récupération du registre
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) return res.status(404).send("Erreur : Signal non identifié.");

        // 2. Téléchargement simultané des deux fragments
        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        // 3. Fusion binaire
        let combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        
        // 4. DÉCODAGE XOR (Le secret du Gardien)
        // On applique la clé pour restaurer le MP3 original
        for (let i = 0; i < combined.length; i++) {
            combined[i] ^= CLE_SECRET.charCodeAt(i % CLE_SECRET.length);
        }

        // 5. Envoi au navigateur
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', combined.length);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Access-Control-Allow-Origin', '*');

        return res.send(combined);

    } catch (e) {
        return res.status(500).send(`Erreur de synchronisation : ${e.message}`);
    }
}
