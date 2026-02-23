export default async function handler(req, res) {
  const PART_A = "https://raw.githubusercontent.com/mvx1533-glitch/assets-cdn/main/sig_part_A.dat";
  const PART_B = "https://1533.re/sys_v1533/sig_part_B.dat";
  const KEY = "6644566";

  try {
    const [resA, resB] = await Promise.all([
      fetch(PART_A).then(r => r.arrayBuffer()),
      fetch(PART_B).then(r => r.arrayBuffer())
    ]);

    const combined = new Uint8Array(resA.byteLength + resB.byteLength);
    combined.set(new Uint8Array(resA), 0);
    combined.set(new Uint8Array(resB), resA.byteLength);

    for (let i = 0; i < combined.length; i++) {
      combined[i] ^= KEY.charCodeAt(i % KEY.length);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(combined));
  } catch (e) {
    res.status(500).send("Signal interrompu : " + e.message);
  }
}
