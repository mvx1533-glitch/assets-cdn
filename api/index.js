const axios = require('axios');

export default async function handler(req, res) {
    // 1. On récupère l'ID du signal (ex: ?id=bebe)
    const { id } = req.query;

    if (!id) {
        return res.status(400).send("Identifiant du Signal manquant.");
    }

    try {
        // 2. On interroge ta passerelle PHP sur 1533.re
        const registryResponse = await axios.get(`https://1533.re/sys_v1533/get_signal.php?id=${id}`);
        const signalData = registryResponse.data;

        if (!signalData || signalData.error) {
            return res.status(404).send("Signal inconnu dans le registre.");
        }

        // 3. On récupère les deux fragments indiqués par la base
        const [partA, partB] = await Promise.all([
            axios.get(signalData.file_5_url, { responseType: 'arraybuffer' }),
            axios.get(signalData.file_95_url, { responseType: 'arraybuffer' })
        ]);

        // 4. Fusion avec la Coudée (secret_key de la base)
        const combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);

        // 5. Diffusion
        res.setHeader('Content-Type', 'audio/mpeg');
        res.send(combined);

    } catch (error) {
        res.status(500).send("Erreur de synchronisation du Signal.");
    }
}
