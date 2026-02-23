const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        // On lit le registre directement sur GitHub pour éviter la 404 d'OVH
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) {
            throw new Error("Signal inconnu dans le registre JSON");
        }

        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(combined);
    } catch (e) {
        res.status(500).send(`Erreur : ${e.message}`);
    }
}
