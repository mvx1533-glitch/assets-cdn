const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        // 1. Lecture du registre JSON
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) return res.status(404).send("Erreur : Signal inconnu dans le registre.");

        // 2. Récupération des deux fragments avec détection d'erreur précise
        let partA, partB;
        try {
            partA = await axios.get(data.file_5_url, { responseType: 'arraybuffer' });
        } catch (err) {
            return res.status(500).send("Erreur : Impossible de lire la Partie A (GitHub)");
        }

        try {
            partB = await axios.get(data.file_95_url, { responseType: 'arraybuffer' });
        } catch (err) {
            return res.status(500).send("Erreur : Impossible de lire la Partie B (OVH). Vérifiez le lien et le .htaccess");
        }

        // 3. Fusion binaire
        const combined = Buffer.concat([
            Buffer.from(partA.data), 
            Buffer.from(partB.data)
        ]);
        
        // 4. Forçage des réglages audio pour le navigateur
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', combined.length);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');

        return res.send(combined);

    } catch (e) {
        return res.status(500).send(`Erreur système : ${e.message}`);
    }
}
