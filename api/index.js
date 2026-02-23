const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) return res.status(404).send("Signal inconnu");

        // Récupération des deux fragments
        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        // Fusion binaire
        const combined = Buffer.concat([
            Buffer.from(partA.data), 
            Buffer.from(partB.data)
        ]);
        
        // Headers pour forcer la lecture audio immédiate
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', combined.length);
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Content-Disposition', 'inline'); // Dit au navigateur : "Joue-le, ne le télécharge pas"

        return res.send(combined);

    } catch (e) {
        return res.status(500).send(`Erreur de synchronisation : ${e.message}`);
    }
}
