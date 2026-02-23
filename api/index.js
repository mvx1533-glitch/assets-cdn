const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    try {
        const registry = await axios.get(`https://1533.re/sys_v1533/get_signal.php?id=${id}`);
        const data = registry.data;

        if (!data.file_5_url || !data.file_95_url) {
            throw new Error("Liens manquants dans la base");
        }

        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(combined);
    } catch (e) {
        // ICI : On affiche la vraie raison du bug
        res.status(500).send(`Erreur : ${e.message} | URL tentée : https://1533.re/sys_v1533/get_signal.php?id=${id}`);
    }
}
