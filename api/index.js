const axios = require('axios');

export default async function handler(req, res) {
    const { id } = req.query;
    if (!id) return res.status(400).send("ID manquant");

    try {
        // Interrogation du messager que tu viens de réparer
        const registry = await axios.get(`https://1533.re/sys_v1533/get_signal.php?id=${id}`);
        const data = registry.data;

        // Récupération des deux fragments
        const [partA, partB] = await Promise.all([
            axios.get(data.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(data.file_95_url, { responseType: 'arraybuffer' })
        ]);

        // Fusion avec la Coudée dynamique (6644566)
        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(combined);
    } catch (e) {
        res.status(500).send("Erreur de synchronisation");
    }
}
