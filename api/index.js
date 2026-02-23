const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        // Lecture du registre JSON sur GitHub
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) {
            return res.status(404).send("Erreur : Signal inconnu");
        }

        // Récupération des deux fragments
        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        // Fusion simple
        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        
        // Envoi simple (le réglage qui affichait le lecteur)
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(combined);

    } catch (e) {
        res.status(500).send(`Erreur : ${e.message}`);
    }
}
