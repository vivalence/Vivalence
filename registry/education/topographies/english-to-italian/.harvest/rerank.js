import base from "../dataset/literals/sentences.js"
const sentences = base
import verb from "../dataset/literals/words/verb.js"
import noun from "../dataset/literals/words/noun.js"
import adjective from "../dataset/literals/words/adjective.js"
import adverb from "../dataset/literals/words/adverb.js"
import pronoun from "../dataset/literals/words/pronoun.js"

const words = [verb, noun, adjective, adverb, pronoun].flat()

const lex = words.reduce((m, w) => {
  const form = w.trait.TRANSLATED.learning.toLowerCase()
  const zipf = w.trait.RANKED?.zipf ?? 0
  const lemma = w.slug.split(".")[0]
  const prev = m.get(form)
  return (!prev || zipf > prev.zipf) ? m.set(form, { zipf, lemma }) : m
}, new Map())

const FREE = new Set(`il lo la i gli le l un uno una di a da in con su per tra fra
al allo alla ai agli alle del dello della dei degli delle dal dallo dalla nel nello nella nei nelle
sul sullo sulla e o ma che se perche perché come dov com c ce po piu più
grazie prego ciao arrivederci si sì no signore signora
uno due tre quattro cinque sei sette otto nove dieci venti trenta cento mille
tom marco roma italia berlino euro wifi taxi hotel bar menu`.split(/\s+/))

const toks = (t) =>
  t.toLowerCase().replace(/[''’]/g, " ").match(/[a-zàèéìíòóùú]+/g) ?? []

const anchor = (s) =>
  toks(s.trait.TRANSLATED.learning)
    .filter((t) => !FREE.has(t))
    .map((t) => lex.get(t) ?? { zipf: 2.5, lemma: t })
    .reduce((worst, w) => (w.zipf < worst.zipf ? w : worst), { zipf: 99, lemma: "_" })

const T0 = `buongiorno-come-sta
ciao-come-stai
buonasera-come-va
buonanotte-a-domani
piacere-di-conoscerla
mi-chiamo-marco
come-si-chiama
di-dov-e
sono-di-berlino
abito-a-berlino
sono-qui-in-vacanza
sono-qui-per-lavoro
sto-bene-grazie
tutto-bene-e-tu
non-c-e-male
e-tu
e-lei
per-favore
grazie-mille
di-niente
no-grazie
si-per-favore
mi-scusi
scusa-il-ritardo
posso-passare
mi-dispiace
va-bene
sono-d-accordo
certo-che-si
si-volentieri
puo-darsi
purtroppo-no
un-attimo-per-favore
non-lo-so
non-capisco
ho-capito
non-ho-capito
non-parlo-italiano
parlo-solo-un-po-di-italiano
sto-imparando-l-italiano
parla-inglese
parli-inglese
puo-ripetere-per-favore
puo-parlare-piu-lentamente
piu-lentamente-per-favore
puo-scriverlo
come-si-dice-questo
che-cosa-significa
cosa-significa-questa-parola
puo-aiutarmi
puo-aiutarmi-per-favore
arrivederci-a-presto
ci-vediamo
a-domani-2
a-dopo
buona-giornata`.split(/\s+/)

const T1 = `avete-un-tavolo-libero
un-tavolo-per-due-per-favore
un-tavolo-per-uno
e-libero-questo-posto
ho-una-prenotazione
senta-scusi
il-menu-per-favore
posso-avere-il-menu
cosa-consiglia
acqua-naturale-o-frizzante
vorrei-ordinare
ordiniamo
per-me-un-caffe
per-me-la-pasta
anche-per-me
posso-avere-un-caffe
posso-avere-dell-acqua
vorrei-un-caffe-caldo
un-altro-caffe-per-favore
vorrei-un-panino-con-formaggio
vorrei-del-vino-rosso
buon-appetito
grazie-altrettanto
ho-fame
ho-sete
sono-allergico-al-latte
da-portare-via-per-favore
basta-cosi-grazie
il-conto-per-favore
il-conto-e-di-venti-euro
quanto-costa
quanto-viene
posso-pagare-con-la-carta
posso-pagare-in-contanti
va-bene-cosi
dov-e-il-bancomat
vorrei-prenotare-un-tavolo-per-due
prenoto-un-tavolo-per-stasera
prenotiamo-un-tavolo-al-ristorante-per-stasera
ordino-la-pizza-con-formaggio
ordiniamo-due-caffe
ordiniamo-un-insalata-e-del-pane
preferisco-il-caffe
preferisco-il-vino
preferisci-il-caffe-o-il-vino
e-ora-di-cena
a-che-ora-e-la-colazione
la-colazione-e-inclusa`.split(/\s+/)

const T1b = `vorrei-questo
prendo-questo
lo-prendo
sto-solo-guardando-grazie
quanto-costa-la-camicia
avete-questo-in-un-altra-taglia
nient-altro-grazie
c-e-uno-sconto-oggi
a-che-ora-apre
a-che-ora-chiude
a-che-ora-2
e-aperto-di-domenica
che-ore-sono
dov-e-la-stazione
dov-e-la-biglietteria
vorrei-un-biglietto-per-roma
un-biglietto-di-andata-e-ritorno
dove-posso-comprare-i-biglietti
a-che-ora-parte-il-treno
da-quale-binario-parte
il-treno-e-in-ritardo
la-stazione-e-qui-vicino
dove-va-questo-autobus
dove-devo-scendere
la-prossima-fermata-per-favore
puo-chiamarmi-un-taxi
quanto-tempo-ci-vuole
e-lontano
dov-e-la-porta-di-imbarco
a-destra
a-sinistra
sempre-dritto
giri-a-destra-al-semaforo
dov-e-l-uscita
dov-e-il-supermercato-piu-vicino
vorrei-una-mappa-della-citta
dov-e-il-bagno
una-camera-per-due-notti
la-camera-e-al-terzo-piano
l-albergo-e-in-centro
c-e-il-wifi
posso-avere-un-cuscino
posso-lasciare-qui-il-bagaglio
dov-e-la-chiave
non-funziona
mi-sono-chiuso-fuori
sto-male
mi-serve-un-medico
c-e-una-farmacia-qui-vicino
devo-andare-in-farmacia
mi-sono-perso
ho-perso-il-passaporto
chiami-la-polizia
chiami-un-ambulanza
puo-farci-una-foto`.split(/\s+/)

const tier = (s) => {
  const i0 = T0.indexOf(s.slug)
  if (i0 >= 0) return [0, i0]
  const i1 = T1.indexOf(s.slug)
  if (i1 >= 0) return [1, i1]
  const i1b = T1b.indexOf(s.slug)
  if (i1b >= 0) return [1.5, i1b]
  const a = anchor(s)
  return [2, -a.zipf, a.lemma, toks(s.trait.TRANSLATED.learning).length]
}

const cmp = (a, b) => {
  const [ta, tb] = [tier(a), tier(b)]
  for (let i = 0; i < Math.max(ta.length, tb.length); i++) {
    const [x, y] = [ta[i], tb[i]]
    if (x === y) continue
    if (x === undefined) return -1
    if (y === undefined) return 1
    return x < y ? -1 : 1
  }
  return 0
}

const reranked = sentences.toSorted(cmp).map((s, i) => ({
  ...s,
  trait: { ...s.trait, RANKED: { rank: i + 1 } },
}))

const byOriginal = new Map(sentences.map((s, i) => [s.slug, i]))
const output = sentences.map((s) => {
  const r = reranked.findIndex((x) => x.slug === s.slug) + 1
  return { ...s, trait: { ...s.trait, RANKED: { rank: r } } }
})

const chopCandidates = reranked
  .filter((s) => !s.traits.includes("VOCALIZED"))
  .filter((s) => /\btom\b|scimmia/i.test(s.trait.TRANSLATED.learning))
  .map((s) => s.slug)

await Deno.writeTextFile(
  "sentences.reranked.js",
  "export default " + JSON.stringify(output, null, 2) + "\n",
)
await Deno.writeTextFile(
  "rank-report.txt",
  [
    ...reranked.slice(0, 160).map((s) =>
      `${String(s.trait.RANKED.rank).padStart(4)} ${s.trait.TRANSLATED.learning}  —  ${s.trait.TRANSLATED.known}`
    ),
    "",
    "CHOP CANDIDATES (no freight, junk content):",
    ...chopCandidates,
  ].join("\n"),
)
console.log("done", output.length, "chop:", chopCandidates.length)
