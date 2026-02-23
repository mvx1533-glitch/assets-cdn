const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        // Lecture directe du registre que tu viens de créer sur GitHub
        const registryUrl = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/signal.json";
        const response = await axios.get(registryUrl);
        const data = response.data[id];

        if (!data) {
            return res.status(404).send("Erreur : Signal inconnu dans le registre.");
        }

        // Fusion des deux fragments (A depuis GitHub, B depuis ton site)
        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(combined);
    } catch (e) {
        res.status(500).send(`Erreur de synchronisation : ${e.message}`);
        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        
        // Configuration pour forcer la lecture audio
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', combined.length); // Indique la taille totale au navigateur
        res.setHeader('Accept-Ranges', 'bytes'); // Permet d'avancer dans la chanson
        
        res.send(combined);
    }
}
