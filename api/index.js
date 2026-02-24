const axios = require('axios');

export default async function handler(req, res) {
    const { id, stream } = req.query;
    const CLE_SECRET = "6644566";
    const PASSERELLE = "https://1533.re/sys_v1533/passerelle.php";

    try {
        // 1. Récupération des infos dans la base
        const responseBase = await axios.get(`${PASSERELLE}?id=${id}`);
        const { fichier_5, fichier_95, titre_auteur } = responseBase.data;
        const [titre, auteur] = titre_auteur ? titre_auteur.split('|') : ["Signal Inconnu", "Gardien"];

        // 2. Si on demande le flux audio direct (pour le lecteur)
        if (stream === "true") {
            const [partA, partB] = await Promise.all([
                axios.get(`https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/${fichier_5}`, { responseType: 'arraybuffer' }),
                axios.get(`https://1533.re/sys_v1533/${fichier_95}`, { responseType: 'arraybuffer' })
            ]);

            let combined = Buffer.concat([Buffer.from(partA.data), Buffer.from(partB.data)]);
            for (let i = 0; i < combined.length; i++) {
                combined[i] ^= CLE_SECRET.charCodeAt(i % CLE_SECRET.length);
            }
            res.setHeader('Content-Type', 'audio/mpeg');
            return res.send(combined);
        }

        // 3. Sinon, on affiche l'INTERFACE VISUELLE
        res.setHeader('Content-Type', 'text/html');
        return res.send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SIGNAL 15:33 | ${titre}</title>
                <style>
                    body { background: #0a0a0a; color: #d4af37; font-family: 'Courier New', monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; overflow: hidden; }
                    .container { text-align: center; border: 1px solid #333; padding: 40px; border-radius: 5px; background: rgba(20,20,20,0.8); box-shadow: 0 0 20px rgba(0,0,0,1); }
                    h1 { letter-spacing: 5px; text-transform: uppercase; margin-bottom: 10px; font-size: 1.5em; }
                    h2 { color: #888; font-size: 1em; margin-bottom: 30px; }
                    .orb { width: 150px; height: 150px; background: radial-gradient(circle, #d4af37 0%, transparent 70%); margin: 0 auto 30px; border-radius: 50%; filter: blur(10px); animation: pulse 2s infinite; opacity: 0.6; }
                    @keyframes pulse { 0% { transform: scale(0.9); opacity: 0.4; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(0.9); opacity: 0.4; } }
                    audio { filter: invert(1); width: 300px; margin-top: 20px; }
                    .id-tag { font-size: 0.7em; color: #444; margin-top: 40px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="orb"></div>
                    <h1>${titre}</h1>
                    <h2>${auteur}</h2>
                    <audio controls autoplay>
                        <source src="/api?id=${id}&stream=true" type="audio/mpeg">
                        Votre navigateur ne supporte pas le signal.
                    </audio>
                    <div class="id-tag">ID: ${id} | REGISTRE 15:33</div>
                </div>
            </body>
            </html>
        `);

    } catch (e) {
        return res.status(500).send("Erreur de synchronisation du Signal.");
    }
}
