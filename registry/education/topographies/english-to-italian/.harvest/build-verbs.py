import json
import re

BASE = "/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals"

CELLS = [
    ("first", "singular"), ("second", "singular"), ("third", "singular"),
    ("first", "plural"), ("second", "plural"), ("third", "plural"),
]
SLOTS = ["firstSingular", "secondSingular", "thirdSingular", "firstPlural", "secondPlural", "thirdPlural"]
TENSES = [("present", "indicative"), ("imperfect", "indicative"), ("future", "indicative"),
          ("conditional", None), ("present", "subjunctive")]

VERBS = [
    {
        "lemma": "essere", "suffix": "ere", "regularity": "irregular", "priority": 1,
        "nonfinite": {
            "infinitive": ("essere", "to be", "I want to be honest", "Voglio essere sincero"),
            "gerund": ("essendo", "being", "Being tired, I stay home", "Essendo stanco, resto a casa"),
            "participle": ("stato", "been", "I have been to Venice", "Sono stato a Venezia"),
        },
        "imperative": ("sii", "be!", "Be kind!", "Sii gentile!"),
        "tenses": {
            "present.indicative": [
                ("sono", "I am", "I am from Rome", "Sono di Roma"),
                ("sei", "you are", "You are very kind", "Sei molto gentile"),
                ("è", "he/she/it is", "It is a good restaurant", "È un buon ristorante"),
                ("siamo", "we are", "We are late", "Siamo in ritardo"),
                ("siete", "you all are", "Are you all ready?", "Siete pronti?"),
                ("sono", "they are", "The rooms are clean", "Le camere sono pulite"),
            ],
            "imperfect.indicative": [
                ("ero", "I was", "I was very young", "Ero molto giovane"),
                ("eri", "you were", "Were you at home yesterday?", "Eri a casa ieri?"),
                ("era", "he/she/it was", "The film was beautiful", "Il film era bello"),
                ("eravamo", "we were", "We were at the seaside", "Eravamo al mare"),
                ("eravate", "you all were", "Were you all together?", "Eravate insieme?"),
                ("erano", "they were", "The streets were empty", "Le strade erano vuote"),
            ],
            "future.indicative": [
                ("sarò", "I will be", "Tomorrow I will be in Milan", "Domani sarò a Milano"),
                ("sarai", "you will be", "You will be glad", "Sarai contento"),
                ("sarà", "he/she/it will be", "It will be a beautiful day", "Sarà una bella giornata"),
                ("saremo", "we will be", "We will be ten at dinner", "Saremo dieci a cena"),
                ("sarete", "you all will be", "You all will be tired after the trip", "Sarete stanchi dopo il viaggio"),
                ("saranno", "they will be", "The shops will be closed", "I negozi saranno chiusi"),
            ],
            "conditional": [
                ("sarei", "I would be", "I would be happy to come", "Sarei felice di venire"),
                ("saresti", "you would be", "Would you be free tomorrow?", "Saresti libero domani?"),
                ("sarebbe", "he/she/it would be", "It would be a good idea", "Sarebbe una buona idea"),
                ("saremmo", "we would be", "We would be faster by train", "Saremmo più veloci in treno"),
                ("sareste", "you all would be", "Would you all be willing to help?", "Sareste disposti ad aiutare?"),
                ("sarebbero", "they would be", "They would be perfect together", "Sarebbero perfetti insieme"),
            ],
            "present.subjunctive": [
                ("sia", "(that) I be", "They think that I am shy", "Pensano che io sia timido"),
                ("sia", "(that) you be", "I think that you are tired", "Credo che tu sia stanco"),
                ("sia", "(that) he/she be", "I hope that it is true", "Spero che sia vero"),
                ("siamo", "(that) we be", "They want us to be punctual", "Vogliono che siamo puntuali"),
                ("siate", "(that) you all be", "I hope that you all are happy", "Spero che siate contenti"),
                ("siano", "(that) they be", "I think that they are on holiday", "Penso che siano in vacanza"),
            ],
        },
    },
    {
        "lemma": "avere", "suffix": "ere", "regularity": "irregular", "priority": 2,
        "nonfinite": {
            "infinitive": ("avere", "to have", "I would like to have more time", "Vorrei avere più tempo"),
            "gerund": ("avendo", "having", "Being hungry, I order right away", "Avendo fame, ordino subito"),
            "participle": ("avuto", "had", "I have had luck", "Ho avuto fortuna"),
        },
        "imperative": ("abbi", "have...!", "Have patience!", "Abbi pazienza!"),
        "tenses": {
            "present.indicative": [
                ("ho", "I have", "I have two sisters", "Ho due sorelle"),
                ("hai", "you have", "Do you have a pen?", "Hai una penna?"),
                ("ha", "he/she/it has", "He has a new car", "Ha una macchina nuova"),
                ("abbiamo", "we have", "We have little time", "Abbiamo poco tempo"),
                ("avete", "you all have", "Do you have a table for two?", "Avete un tavolo per due?"),
                ("hanno", "they have", "They have a dog and a cat", "Hanno un cane e un gatto"),
            ],
            "imperfect.indicative": [
                ("avevo", "I used to have", "I used to have long hair", "Avevo i capelli lunghi"),
                ("avevi", "you used to have", "You were the one who was right", "Avevi ragione tu"),
                ("aveva", "he/she used to have", "He was afraid of the dark", "Aveva paura del buio"),
                ("avevamo", "we used to have", "We used to have a house in the countryside", "Avevamo una casa in campagna"),
                ("avevate", "you all used to have", "Did you all already have the tickets?", "Avevate già i biglietti?"),
                ("avevano", "they used to have", "They used to have many friends", "Avevano molti amici"),
            ],
            "future.indicative": [
                ("avrò", "I will have", "I will have an answer tomorrow", "Avrò una risposta domani"),
                ("avrai", "you will have", "You will need help", "Avrai bisogno di aiuto"),
                ("avrà", "he/she/it will have", "He will have time next week", "Avrà tempo la prossima settimana"),
                ("avremo", "we will have", "We will have guests tonight", "Avremo ospiti stasera"),
                ("avrete", "you all will have", "You all will have a surprise", "Avrete una sorpresa"),
                ("avranno", "they will have", "They will be hungry after the match", "Avranno fame dopo la partita"),
            ],
            "conditional": [
                ("avrei", "I would have", "I would have a question", "Avrei una domanda"),
                ("avresti", "you would have", "Would you have a minute for me?", "Avresti un minuto per me?"),
                ("avrebbe", "he/she/it would have", "It would make sense to leave early", "Avrebbe senso partire presto"),
                ("avremmo", "we would have", "We would need two rooms", "Avremmo bisogno di due camere"),
                ("avreste", "you all would have", "Would you all have room for us?", "Avreste spazio per noi?"),
                ("avrebbero", "they would have", "They would have time on Sunday", "Avrebbero tempo domenica"),
            ],
            "present.subjunctive": [
                ("abbia", "(that) I have", "They think that I am wrong", "Pensano che io abbia torto"),
                ("abbia", "(that) you have", "I hope that you are right", "Spero che tu abbia ragione"),
                ("abbia", "(that) he/she have", "I think that he is hungry", "Credo che abbia fame"),
                ("abbiamo", "(that) we have", "They hope that we succeed", "Sperano che abbiamo successo"),
                ("abbiate", "(that) you all have", "I hope that you all have patience", "Spero che abbiate pazienza"),
                ("abbiano", "(that) they have", "I doubt that they have time", "Dubito che abbiano tempo"),
            ],
        },
    },
    {
        "lemma": "parlare", "suffix": "are", "regularity": "regular", "priority": 3,
        "nonfinite": {
            "infinitive": ("parlare", "to speak", "I would like to speak with the manager", "Vorrei parlare con il direttore"),
            "gerund": ("parlando", "speaking", "We are speaking about work", "Stiamo parlando di lavoro"),
            "participle": ("parlato", "spoken", "We have spoken for a long time", "Abbiamo parlato a lungo"),
        },
        "imperative": ("parla", "speak!", "Speak more slowly!", "Parla più lentamente!"),
        "tenses": {
            "present.indicative": [
                ("parlo", "I speak", "I speak a little Italian", "Parlo un po' di italiano"),
                ("parli", "you speak", "You speak very well", "Parli molto bene"),
                ("parla", "he/she speaks", "He speaks three languages", "Parla tre lingue"),
                ("parliamo", "we speak", "We often speak on the phone", "Parliamo spesso al telefono"),
                ("parlate", "you all speak", "Do you all speak English?", "Parlate inglese?"),
                ("parlano", "they speak", "They speak too fast", "Parlano troppo veloce"),
            ],
            "imperfect.indicative": [
                ("parlavo", "I used to speak", "As a child I used to speak little", "Da bambino parlavo poco"),
                ("parlavi", "you were speaking", "Who were you speaking with?", "Parlavi con chi?"),
                ("parlava", "he/she used to speak", "She always used to speak about you", "Parlava sempre di te"),
                ("parlavamo", "we used to speak", "We used to speak every evening", "Parlavamo ogni sera"),
                ("parlavate", "you all were speaking", "Were you all talking about the trip?", "Parlavate del viaggio?"),
                ("parlavano", "they used to speak", "They used to speak in dialect", "Parlavano in dialetto"),
            ],
            "future.indicative": [
                ("parlerò", "I will speak", "I will speak with her tomorrow", "Parlerò con lei domani"),
                ("parlerai", "you will speak", "You will speak first", "Parlerai tu per primo"),
                ("parlerà", "he/she will speak", "The mayor will speak", "Parlerà il sindaco"),
                ("parleremo", "we will speak", "We will talk about it at dinner", "Ne parleremo a cena"),
                ("parlerete", "you all will speak", "You all will speak in front of everyone", "Parlerete davanti a tutti"),
                ("parleranno", "they will speak", "The parents will speak", "Parleranno i genitori"),
            ],
            "conditional": [
                ("parlerei", "I would speak", "I would gladly speak with him", "Parlerei volentieri con lui"),
                ("parleresti", "you would speak", "Would you speak louder?", "Parleresti più forte?"),
                ("parlerebbe", "he/she would speak", "He would speak for hours", "Parlerebbe per ore"),
                ("parleremmo", "we would speak", "We would speak better in person", "Parleremmo meglio di persona"),
                ("parlereste", "you all would speak", "Would you all speak with the teacher?", "Parlereste con il professore?"),
                ("parlerebbero", "they would speak", "They would gladly speak with you", "Parlerebbero volentieri con te"),
            ],
            "present.subjunctive": [
                ("parli", "(that) I speak", "They want me to speak first", "Vogliono che io parli per primo"),
                ("parli", "(that) you speak", "It is important that you speak clearly", "È importante che tu parli chiaro"),
                ("parli", "(that) he/she speak", "I hope that she speaks soon", "Spero che parli presto"),
                ("parliamo", "(that) we speak", "They prefer that we speak Italian", "Preferiscono che parliamo italiano"),
                ("parliate", "(that) you all speak", "I ask that you all speak softly", "Chiedo che parliate piano"),
                ("parlino", "(that) they speak", "I want them to speak with me", "Voglio che parlino con me"),
            ],
        },
    },
    {
        "lemma": "credere", "suffix": "ere", "regularity": "regular", "priority": 4,
        "nonfinite": {
            "infinitive": ("credere", "to believe", "It is hard to believe this story", "È difficile credere a questa storia"),
            "gerund": ("credendo", "believing", "Believing the forecast, I bring the umbrella", "Credendo alla previsione, porto l'ombrello"),
            "participle": ("creduto", "believed", "I did not believe it", "Non ci ho creduto"),
        },
        "imperative": ("credi", "believe!", "Believe in yourself!", "Credi in te stesso!"),
        "tenses": {
            "present.indicative": [
                ("credo", "I believe", "I believe so", "Credo di sì"),
                ("credi", "you believe", "Do you believe in ghosts?", "Credi ai fantasmi?"),
                ("crede", "he/she believes", "She believes in you", "Crede in te"),
                ("crediamo", "we believe", "We believe in science", "Crediamo nella scienza"),
                ("credete", "you all believe", "Do you all believe this news?", "Credete a questa notizia?"),
                ("credono", "they believe", "They believe their coach", "Credono al loro allenatore"),
            ],
            "imperfect.indicative": [
                ("credevo", "I believed", "I thought I knew you", "Credevo di conoscerti"),
                ("credevi", "you used to believe", "Did you use to believe in fairy tales?", "Credevi alle favole?"),
                ("credeva", "he/she believed", "He believed every word", "Credeva a ogni parola"),
                ("credevamo", "we believed", "We believed the same thing", "Credevamo alla stessa cosa"),
                ("credevate", "you all believed", "Did you all really believe that excuse?", "Credevate davvero a quella scusa?"),
                ("credevano", "they used to believe", "They still believed in Santa Claus", "Credevano ancora a Babbo Natale"),
            ],
            "future.indicative": [
                ("crederò", "I will believe", "I will believe you this time", "Ti crederò questa volta"),
                ("crederai", "you will believe", "You will never believe it", "Non ci crederai mai"),
                ("crederà", "he/she will believe", "People will believe it", "La gente ci crederà"),
                ("crederemo", "we will believe", "We will believe the facts", "Crederemo ai fatti"),
                ("crederete", "you all will believe", "You all will not believe your eyes", "Non crederete ai vostri occhi"),
                ("crederanno", "they will believe", "Will your friends believe me?", "I tuoi amici mi crederanno?"),
            ],
            "conditional": [
                ("crederei", "I would believe", "I would never believe it", "Non ci crederei mai"),
                ("crederesti", "you would believe", "Would you believe such a thing?", "Crederesti a una cosa simile?"),
                ("crederebbe", "he/she would believe", "Nobody would believe you", "Nessuno ti crederebbe"),
                ("crederemmo", "we would believe", "We would not believe it possible", "Non lo crederemmo possibile"),
                ("credereste", "you all would believe", "Would you all believe it?", "Ci credereste?"),
                ("crederebbero", "they would believe", "Few would believe it", "Pochi ci crederebbero"),
            ],
            "present.subjunctive": [
                ("creda", "(that) I believe", "Do you think that I believe everything?", "Pensi che io creda a tutto?"),
                ("creda", "(that) you believe", "It is enough that you believe in it", "Basta che tu ci creda"),
                ("creda", "(that) he/she believe", "It is strange that he believes it", "È strano che ci creda"),
                ("crediamo", "(that) we believe", "He wants us to believe his version", "Vuole che crediamo alla sua versione"),
                ("crediate", "(that) you all believe", "It is enough for me that you all believe it", "Mi basta che ci crediate"),
                ("credano", "(that) they believe", "I doubt that they believe it", "Dubito che ci credano"),
            ],
        },
    },
    {
        "lemma": "dormire", "suffix": "ire", "regularity": "regular", "priority": 5,
        "nonfinite": {
            "infinitive": ("dormire", "to sleep", "I need to sleep", "Ho bisogno di dormire"),
            "gerund": ("dormendo", "sleeping", "The child is sleeping", "Il bambino sta dormendo"),
            "participle": ("dormito", "slept", "Did you sleep well?", "Hai dormito bene?"),
        },
        "imperative": ("dormi", "sleep!", "Sleep, it is late!", "Dormi, è tardi!"),
        "tenses": {
            "present.indicative": [
                ("dormo", "I sleep", "I sleep eight hours a night", "Dormo otto ore a notte"),
                ("dormi", "you sleep", "Are you still sleeping?", "Dormi ancora?"),
                ("dorme", "he/she sleeps", "The cat always sleeps", "Il gatto dorme sempre"),
                ("dormiamo", "we sleep", "On holiday we sleep in late", "In vacanza dormiamo fino a tardi"),
                ("dormite", "you all sleep", "Do you all sleep with the window open?", "Dormite con la finestra aperta?"),
                ("dormono", "they sleep", "The children are already sleeping", "I bambini dormono già"),
            ],
            "imperfect.indicative": [
                ("dormivo", "I was sleeping", "I was sleeping when you called", "Dormivo quando hai chiamato"),
                ("dormivi", "you were sleeping", "Were you already sleeping at nine?", "Dormivi già alle nove?"),
                ("dormiva", "he/she used to sleep", "The dog used to sleep in the garden", "Il cane dormiva in giardino"),
                ("dormivamo", "we used to sleep", "We used to sleep in a tent", "Dormivamo in tenda"),
                ("dormivate", "you all were sleeping", "Were you all still sleeping at noon?", "Dormivate ancora a mezzogiorno?"),
                ("dormivano", "they were sleeping", "They were all sleeping in the house", "Dormivano tutti in casa"),
            ],
            "future.indicative": [
                ("dormirò", "I will sleep", "Tonight I will sleep early", "Stanotte dormirò presto"),
                ("dormirai", "you will sleep", "You will sleep on the sofa", "Dormirai sul divano"),
                ("dormirà", "he/she will sleep", "The little one will sleep at our place", "Il piccolo dormirà da noi"),
                ("dormiremo", "we will sleep", "We will sleep in a hotel", "Dormiremo in albergo"),
                ("dormirete", "you all will sleep", "You all will sleep in the big room", "Dormirete nella camera grande"),
                ("dormiranno", "they will sleep", "The guests will sleep here", "Gli ospiti dormiranno qui"),
            ],
            "conditional": [
                ("dormirei", "I would sleep", "I would sleep all day", "Dormirei tutto il giorno"),
                ("dormiresti", "you would sleep", "Would you sleep on the floor?", "Dormiresti per terra?"),
                ("dormirebbe", "he/she would sleep", "He would sleep anywhere", "Dormirebbe ovunque"),
                ("dormiremmo", "we would sleep", "We would gladly sleep another hour", "Dormiremmo volentieri un'altra ora"),
                ("dormireste", "you all would sleep", "Would you all sleep at a campsite?", "Dormireste in campeggio?"),
                ("dormirebbero", "they would sleep", "They would sleep until noon", "Dormirebbero fino a mezzogiorno"),
            ],
            "present.subjunctive": [
                ("dorma", "(that) I sleep", "They want me to sleep more", "Vogliono che io dorma di più"),
                ("dorma", "(that) you sleep", "It is better that you sleep now", "È meglio che tu dorma adesso"),
                ("dorma", "(that) he/she sleep", "I hope that the baby sleeps", "Spero che il bambino dorma"),
                ("dormiamo", "(that) we sleep", "She prefers that we sleep here", "Preferisce che dormiamo qui"),
                ("dormiate", "(that) you all sleep", "It is important that you all sleep well", "È importante che dormiate bene"),
                ("dormano", "(that) they sleep", "Let them sleep", "Lascia che dormano"),
            ],
        },
    },
    {
        "lemma": "finire", "suffix": "ire", "regularity": "regular", "priority": 6,
        "nonfinite": {
            "infinitive": ("finire", "to finish", "I must finish the work", "Devo finire il lavoro"),
            "gerund": ("finendo", "finishing", "I am finishing now", "Sto finendo adesso"),
            "participle": ("finito", "finished", "I have finished the homework", "Ho finito i compiti"),
        },
        "imperative": ("finisci", "finish!", "Finish your dinner!", "Finisci la cena!"),
        "tenses": {
            "present.indicative": [
                ("finisco", "I finish", "I finish at six", "Finisco alle sei"),
                ("finisci", "you finish", "At what time do you finish?", "A che ora finisci?"),
                ("finisce", "he/she finishes", "The class finishes early", "La lezione finisce presto"),
                ("finiamo", "we finish", "We finish this chapter today", "Oggi finiamo questo capitolo"),
                ("finite", "you all finish", "When do you all finish the project?", "Quando finite il progetto?"),
                ("finiscono", "they finish", "The holidays end on Sunday", "Le vacanze finiscono domenica"),
            ],
            "imperfect.indicative": [
                ("finivo", "I used to finish", "I always used to finish last", "Finivo sempre per ultimo"),
                ("finivi", "you used to finish", "Did you use to finish late every day?", "Finivi tardi ogni giorno?"),
                ("finiva", "he/she used to finish", "The shift used to end at midnight", "Il turno finiva a mezzanotte"),
                ("finivamo", "we used to finish", "We used to finish the homework together", "Finivamo i compiti insieme"),
                ("finivate", "you all used to finish", "At what time did you all use to finish?", "A che ora finivate?"),
                ("finivano", "they used to finish", "The parties used to end at dawn", "Le feste finivano all'alba"),
            ],
            "future.indicative": [
                ("finirò", "I will finish", "I will finish by tonight", "Finirò entro stasera"),
                ("finirai", "you will finish", "Will you finish in time?", "Finirai in tempo?"),
                ("finirà", "he/she will finish", "The course will end in June", "Il corso finirà a giugno"),
                ("finiremo", "we will finish", "We will finish before dinner", "Finiremo prima di cena"),
                ("finirete", "you all will finish", "You all will finish without me", "Finirete senza di me"),
                ("finiranno", "they will finish", "The works will end in May", "I lavori finiranno a maggio"),
            ],
            "conditional": [
                ("finirei", "I would finish", "I would gladly finish earlier", "Finirei volentieri prima"),
                ("finiresti", "you would finish", "Would you finish this for me?", "Finiresti questo per me?"),
                ("finirebbe", "he/she would finish", "She would never stop reading", "Non finirebbe mai di leggere"),
                ("finiremmo", "we would finish", "We would finish in an hour", "Finiremmo in un'ora"),
                ("finireste", "you all would finish", "Would you all finish by Friday?", "Finireste entro venerdì?"),
                ("finirebbero", "they would finish", "They would finish right away with more help", "Finirebbero subito con più aiuto"),
            ],
            "present.subjunctive": [
                ("finisca", "(that) I finish", "Wait until I finish", "Aspetta che io finisca"),
                ("finisca", "(that) you finish", "I want you to finish the homework", "Voglio che tu finisca i compiti"),
                ("finisca", "(that) he/she finish", "I hope that the cold ends", "Spero che il freddo finisca"),
                ("finiamo", "(that) we finish", "He wants us to finish today", "Vuole che finiamo oggi"),
                ("finiate", "(that) you all finish", "I ask that you all finish in silence", "Chiedo che finiate in silenzio"),
                ("finiscano", "(that) they finish", "We wait for them to finish", "Aspettiamo che finiscano"),
            ],
        },
    },
    {
        "lemma": "andare", "suffix": "are", "regularity": "irregular", "priority": 7,
        "nonfinite": {
            "infinitive": ("andare", "to go", "I want to go to Italy", "Voglio andare in Italia"),
            "gerund": ("andando", "going", "I am going to the office", "Sto andando in ufficio"),
            "participle": ("andato", "gone", "I went on foot", "Sono andato a piedi"),
        },
        "imperative": ("vai", "go!", "Go slowly!", "Vai piano!"),
        "tenses": {
            "present.indicative": [
                ("vado", "I go", "I go to work by bike", "Vado al lavoro in bici"),
                ("vai", "you go", "Where are you going?", "Dove vai?"),
                ("va", "he/she/it goes", "The bus goes downtown", "Il bus va in centro"),
                ("andiamo", "we go", "Shall we go to the restaurant?", "Andiamo al ristorante?"),
                ("andate", "you all go", "Do you all often go to the cinema?", "Andate spesso al cinema?"),
                ("vanno", "they go", "The kids go to school", "I ragazzi vanno a scuola"),
            ],
            "imperfect.indicative": [
                ("andavo", "I used to go", "I used to go to the market every Saturday", "Andavo al mercato ogni sabato"),
                ("andavi", "you used to go", "Did you use to go swimming as a kid?", "Andavi a nuoto da piccolo?"),
                ("andava", "he/she used to go", "Grandma used to go to mass", "La nonna andava a messa"),
                ("andavamo", "we used to go", "We always used to go to the mountains", "Andavamo sempre in montagna"),
                ("andavate", "you all used to go", "Where did you all use to go on holiday?", "Dove andavate in vacanza?"),
                ("andavano", "they used to go", "They used to go everywhere on foot", "Andavano a piedi ovunque"),
            ],
            "future.indicative": [
                ("andrò", "I will go", "I will go to Florence in April", "Andrò a Firenze in aprile"),
                ("andrai", "you will go", "Will you go alone?", "Andrai da solo?"),
                ("andrà", "he/she/it will go", "Everything will go well", "Tutto andrà bene"),
                ("andremo", "we will go", "We will go to the concert together", "Andremo al concerto insieme"),
                ("andrete", "you all will go", "Will you all leave early?", "Andrete via presto?"),
                ("andranno", "they will go", "They will go to live in Turin", "Andranno a vivere a Torino"),
            ],
            "conditional": [
                ("andrei", "I would go", "I would gladly go to the seaside", "Andrei volentieri al mare"),
                ("andresti", "you would go", "Would you go get the bread?", "Andresti a prendere il pane?"),
                ("andrebbe", "he/she/it would go", "Would tomorrow work?", "Andrebbe bene domani?"),
                ("andremmo", "we would go", "We would go anywhere with you", "Andremmo ovunque con te"),
                ("andreste", "you all would go", "Would you all go to vote?", "Andreste a votare?"),
                ("andrebbero", "they would go", "They would gladly go on holiday", "Andrebbero volentieri in vacanza"),
            ],
            "present.subjunctive": [
                ("vada", "(that) I go", "They want me to go away", "Vogliono che io vada via"),
                ("vada", "(that) you go", "It is better that you go to bed", "È meglio che tu vada a letto"),
                ("vada", "(that) he/she go", "I hope that everything goes well", "Spero che vada tutto bene"),
                ("andiamo", "(that) we go", "She wants us to go to her place", "Vuole che andiamo da lei"),
                ("andiate", "(that) you all go", "I prefer that you all go by train", "Preferisco che andiate in treno"),
                ("vadano", "(that) they go", "Let them go ahead", "Lascia che vadano avanti"),
            ],
        },
    },
    {
        "lemma": "fare", "suffix": "are", "regularity": "irregular", "priority": 8,
        "nonfinite": {
            "infinitive": ("fare", "to do / to make", "What do you want to do tonight?", "Cosa vuoi fare stasera?"),
            "gerund": ("facendo", "doing", "What are you doing?", "Cosa stai facendo?"),
            "participle": ("fatto", "done / made", "I have made a cake", "Ho fatto una torta"),
        },
        "imperative": ("fai", "do...!", "Pay attention!", "Fai attenzione!"),
        "tenses": {
            "present.indicative": [
                ("faccio", "I do / I make", "I have breakfast at seven", "Faccio colazione alle sette"),
                ("fai", "you do", "What work do you do?", "Che lavoro fai?"),
                ("fa", "he/she/it does", "It is cold tonight", "Fa freddo stasera"),
                ("facciamo", "we do", "Let's take a break", "Facciamo una pausa"),
                ("fate", "you all do", "What do you all do on the weekend?", "Cosa fate nel weekend?"),
                ("fanno", "they do / they make", "The neighbors make noise", "I vicini fanno rumore"),
            ],
            "imperfect.indicative": [
                ("facevo", "I used to do", "I used to do sport every day", "Facevo sport ogni giorno"),
                ("facevi", "you were doing", "What were you doing last night?", "Cosa facevi ieri sera?"),
                ("faceva", "it was / he used to do", "It was very cold", "Faceva molto freddo"),
                ("facevamo", "we used to do", "We used to take long walks", "Facevamo lunghe passeggiate"),
                ("facevate", "you all were doing", "What were you all doing in the garden?", "Cosa facevate in giardino?"),
                ("facevano", "they used to do", "They used to party every evening", "Facevano festa ogni sera"),
            ],
            "future.indicative": [
                ("farò", "I will do", "I will do my best", "Farò del mio meglio"),
                ("farai", "you will do", "What will you do on Sunday?", "Cosa farai domenica?"),
                ("farà", "it will be / he will do", "Tomorrow the weather will be nice", "Domani farà bel tempo"),
                ("faremo", "we will do / we will take", "We will take a trip together", "Faremo un viaggio insieme"),
                ("farete", "you all will do", "What will you all do at Christmas?", "Cosa farete a Natale?"),
                ("faranno", "they will do", "They will be late tonight", "Faranno tardi stasera"),
            ],
            "conditional": [
                ("farei", "I would do", "I would do anything for you", "Farei di tutto per te"),
                ("faresti", "you would do", "Would you do me a favor?", "Mi faresti un favore?"),
                ("farebbe", "he/she would do", "He would do better to rest", "Farebbe meglio a riposare"),
                ("faremmo", "we would do / we would be", "We would be quicker by car", "Faremmo prima in macchina"),
                ("fareste", "you all would do / would make", "Would you all make room for one more?", "Fareste spazio per uno in più?"),
                ("farebbero", "they would do", "They would do anything", "Farebbero qualsiasi cosa"),
            ],
            "present.subjunctive": [
                ("faccia", "(that) I do / make", "Do you want me to make dinner?", "Vuoi che io faccia la cena?"),
                ("faccia", "(that) you do", "You need to pay attention", "Serve che tu faccia attenzione"),
                ("faccia", "(that) it be / he do", "I hope the weather is nice on Sunday", "Spero che faccia bello domenica"),
                ("facciamo", "(that) we do", "He asks that we keep quiet", "Chiede che facciamo silenzio"),
                ("facciate", "(that) you all do", "I want you all to behave", "Voglio che facciate i bravi"),
                ("facciano", "(that) they do", "I wait for them to do their part", "Aspetto che facciano la loro parte"),
            ],
        },
    },
    {
        "lemma": "stare", "suffix": "are", "regularity": "irregular", "priority": 9,
        "nonfinite": {
            "infinitive": ("stare", "to stay / to be", "I prefer to stay home", "Preferisco stare a casa"),
            "gerund": ("stando", "staying", "Staying here, one sees the sea", "Stando qui, si vede il mare"),
            "participle": ("stato", "stayed / been", "I was unwell yesterday", "Sono stato male ieri"),
        },
        "imperative": ("stai", "stay!", "Stay still!", "Stai fermo!"),
        "tenses": {
            "present.indicative": [
                ("sto", "I am / I stay", "I am staying home tonight", "Sto a casa stasera"),
                ("stai", "you are", "How are you?", "Come stai?"),
                ("sta", "he/she is", "Grandma is doing better", "La nonna sta meglio"),
                ("stiamo", "we are", "We are arriving", "Stiamo arrivando"),
                ("state", "you all are", "How are you all?", "Come state?"),
                ("stanno", "they are", "The children are being good", "I bambini stanno buoni"),
            ],
            "imperfect.indicative": [
                ("stavo", "I was", "I was about to go out", "Stavo per uscire"),
                ("stavi", "you were", "Were you feeling better yesterday?", "Stavi meglio ieri?"),
                ("stava", "he/she was", "The patient was feeling ill", "Il paziente stava male"),
                ("stavamo", "we were", "We were about to leave", "Stavamo per partire"),
                ("stavate", "you all were", "Were you all paying attention in class?", "Stavate attenti in classe?"),
                ("stavano", "they were", "They were all silent", "Stavano tutti zitti"),
            ],
            "future.indicative": [
                ("starò", "I will be / stay", "I will be away for a week", "Starò via una settimana"),
                ("starai", "you will be", "You will be comfortable here", "Starai comodo qui"),
                ("starà", "he/she/it will stay", "The dog will stay in the garden", "Il cane starà in giardino"),
                ("staremo", "we will be", "We will be careful", "Staremo attenti"),
                ("starete", "you all will be", "You all will be very well at our place", "Starete benissimo da noi"),
                ("staranno", "they will be", "They will be away for a month", "Staranno via un mese"),
            ],
            "conditional": [
                ("starei", "I would stay", "I would stay in the sun for hours", "Starei ore al sole"),
                ("staresti", "you would be", "Would you be quiet for a moment?", "Staresti zitto un attimo?"),
                ("starebbe", "it would look / he would be", "The painting would look good here", "Il quadro starebbe bene qui"),
                ("staremmo", "we would be", "We would be better off in the shade", "Staremmo meglio all'ombra"),
                ("stareste", "you all would be", "You all would have more room over there", "Stareste più larghi di là"),
                ("starebbero", "they would stay", "They would gladly stay longer", "Starebbero volentieri di più"),
            ],
            "present.subjunctive": [
                ("stia", "(that) I stay / be", "He wants me to stay calm", "Vuole che io stia calmo"),
                ("stia", "(that) you be", "As long as you are careful", "Basta che tu stia attento"),
                ("stia", "(that) he/she be", "I hope that she is well", "Spero che stia bene"),
                ("stiamo", "(that) we stay", "She prefers that we stay together", "Preferisce che stiamo insieme"),
                ("stiate", "(that) you all stay", "I want you all to stay calm", "Voglio che stiate tranquilli"),
                ("stiano", "(that) they be", "I hope that they are comfortable", "Spero che stiano comodi"),
            ],
        },
    },
    {
        "lemma": "dare", "suffix": "are", "regularity": "irregular", "priority": 10,
        "nonfinite": {
            "infinitive": ("dare", "to give", "I would like to give a gift to my mother", "Vorrei dare un regalo a mia madre"),
            "gerund": ("dando", "giving", "Giving advice is not always easy", "Dando consigli non è sempre facile"),
            "participle": ("dato", "given", "I have given the keys to the doorman", "Ho dato le chiavi al portiere"),
        },
        "imperative": ("dai", "give!", "Give me a hand, please!", "Dai una mano, per favore!"),
        "tenses": {
            "present.indicative": [
                ("do", "I give", "I always give the right answer", "Do sempre la risposta giusta"),
                ("dai", "you give", "You give too many excuses", "Dai troppe scuse"),
                ("dà", "he/she/it gives", "The teacher gives a lot of homework", "L'insegnante dà molti compiti"),
                ("diamo", "we give", "We give a discount to students", "Diamo uno sconto agli studenti"),
                ("date", "you all give", "Do you all give tips at the restaurant?", "Date la mancia al ristorante?"),
                ("danno", "they give", "They give good advice", "Danno buoni consigli"),
            ],
            "imperfect.indicative": [
                ("davo", "I used to give", "I used to give bread to the birds", "Davo il pane agli uccelli"),
                ("davi", "you used to give", "You used to give me a ride to school", "Mi davi un passaggio a scuola"),
                ("dava", "he/she used to give", "Grandpa used to give us candy", "Il nonno ci dava le caramelle"),
                ("davamo", "we used to give", "We used to give a party every summer", "Davamo una festa ogni estate"),
                ("davate", "you all used to give", "Did you all use to give exams in June?", "Davate gli esami a giugno?"),
                ("davano", "they used to give", "They used to give free lessons", "Davano lezioni gratuite"),
            ],
            "future.indicative": [
                ("darò", "I will give", "I will give you the answer tomorrow", "Ti darò la risposta domani"),
                ("darai", "you will give", "Will you give a speech at the wedding?", "Darai un discorso al matrimonio?"),
                ("darà", "he/she/it will give", "The director will give a prize to the winner", "Il direttore darà un premio al vincitore"),
                ("daremo", "we will give", "We will give a party for her birthday", "Daremo una festa per il suo compleanno"),
                ("darete", "you all will give", "You all will give the news at dinner", "Darete la notizia a cena"),
                ("daranno", "they will give", "They will give the results on Friday", "Daranno i risultati venerdì"),
            ],
            "conditional": [
                ("darei", "I would give", "I would give anything for a coffee now", "Darei qualsiasi cosa per un caffè adesso"),
                ("daresti", "you would give", "Would you give me your phone number?", "Mi daresti il tuo numero di telefono?"),
                ("darebbe", "he/she/it would give", "The bank would give a loan without problems", "La banca darebbe un prestito senza problemi"),
                ("daremmo", "we would give", "We would give more time to the project", "Daremmo più tempo al progetto"),
                ("dareste", "you all would give", "Would you all give me a hand with the boxes?", "Mi dareste una mano con le scatole?"),
                ("darebbero", "they would give", "They would give the prize to another team", "Darebbero il premio a un'altra squadra"),
            ],
            "present.subjunctive": [
                ("dia", "(that) I give", "They want me to give a speech", "Vogliono che io dia un discorso"),
                ("dia", "(that) you give", "It is important that you give the right answer", "È importante che tu dia la risposta giusta"),
                ("dia", "(that) he/she give", "I hope that the teacher gives good grades", "Spero che l'insegnante dia bei voti"),
                ("diamo", "(that) we give", "She wants us to give a hand to the neighbors", "Vuole che diamo una mano ai vicini"),
                ("diate", "(that) you all give", "I ask that you all give your opinion", "Chiedo che diate la vostra opinione"),
                ("diano", "(that) they give", "I hope that they give good news", "Spero che diano buone notizie"),
            ],
        },
    },
    {
        "lemma": "dire", "suffix": "ire", "regularity": "irregular", "priority": 11,
        "nonfinite": {
            "infinitive": ("dire", "to say / to tell", "I need to tell you something important", "Devo dire una cosa importante"),
            "gerund": ("dicendo", "saying", "Saying goodbye is never easy", "Dicendo addio non è mai facile"),
            "participle": ("detto", "said / told", "I have already told the truth", "Ho già detto la verità"),
        },
        "imperative": ("di'", "tell!", "Tell the truth!", "Di' la verità!"),
        "tenses": {
            "present.indicative": [
                ("dico", "I say", "I always say what I think", "Dico sempre quello che penso"),
                ("dici", "you say", "What do you say about this idea?", "Cosa dici di questa idea?"),
                ("dice", "he/she/it says", "My mother says the soup is ready", "Mia madre dice che la minestra è pronta"),
                ("diciamo", "we say", "We usually say hello to everyone", "Di solito diciamo ciao a tutti"),
                ("dite", "you all say", "What do you all say about the plan?", "Cosa dite del piano?"),
                ("dicono", "they say", "They say the film is very good", "Dicono che il film è molto bello"),
            ],
            "imperfect.indicative": [
                ("dicevo", "I used to say", "I used to say the same joke every time", "Dicevo sempre la stessa battuta"),
                ("dicevi", "you used to say", "What did you used to say to calm her down?", "Cosa dicevi per calmarla?"),
                ("diceva", "he/she used to say", "My grandfather used to say strange things", "Mio nonno diceva cose strane"),
                ("dicevamo", "we used to say", "We used to say good morning in Italian", "Dicevamo buongiorno in italiano"),
                ("dicevate", "you all used to say", "What did you all used to say at the end of class?", "Cosa dicevate alla fine della lezione?"),
                ("dicevano", "they used to say", "They used to say that the water was cold", "Dicevano che l'acqua era fredda"),
            ],
            "future.indicative": [
                ("dirò", "I will say", "I will say a few words at the dinner", "Dirò poche parole alla cena"),
                ("dirai", "you will say", "What will you say to your boss?", "Cosa dirai al tuo capo?"),
                ("dirà", "he/she/it will say", "The doctor will tell us the results tomorrow", "Il medico ci dirà i risultati domani"),
                ("diremo", "we will say", "We will tell everyone the good news", "Diremo a tutti la bella notizia"),
                ("direte", "you all will say", "You all will tell the story at the party", "Direte la storia alla festa"),
                ("diranno", "they will say", "They will say yes for sure", "Diranno di sì di sicuro"),
            ],
            "conditional": [
                ("direi", "I would say", "I would say that the exam was difficult", "Direi che l'esame era difficile"),
                ("diresti", "you would say", "Would you tell me the truth?", "Mi diresti la verità?"),
                ("direbbe", "he/she/it would say", "The professor would say the same thing", "Il professore direbbe la stessa cosa"),
                ("diremmo", "we would say", "We would say no without hesitation", "Diremmo di no senza esitare"),
                ("direste", "you all would say", "Would you all tell me your secret?", "Mi direste il vostro segreto?"),
                ("direbbero", "they would say", "They would say the opposite", "Direbbero il contrario"),
            ],
            "present.subjunctive": [
                ("dica", "(that) I say", "It is better that I tell the truth", "È meglio che io dica la verità"),
                ("dica", "(that) you say", "I want you to tell me everything", "Voglio che tu mi dica tutto"),
                ("dica", "(that) he/she say", "I hope that he tells the truth", "Spero che dica la verità"),
                ("diciamo", "(that) we say", "She wants us to say something nice", "Vuole che diciamo qualcosa di carino"),
                ("diciate", "(that) you all say", "I ask that you all say your names", "Chiedo che diciate i vostri nomi"),
                ("dicano", "(that) they say", "I doubt that they say the truth", "Dubito che dicano la verità"),
            ],
        },
    },
    {
        "lemma": "venire", "suffix": "ire", "regularity": "irregular", "priority": 12,
        "nonfinite": {
            "infinitive": ("venire", "to come", "I want to come to the party too", "Voglio venire anche io alla festa"),
            "gerund": ("venendo", "coming", "Coming from the station, I saw the church", "Venendo dalla stazione, ho visto la chiesa"),
            "participle": ("venuto", "come", "He has come to visit us", "È venuto a trovarci"),
        },
        "imperative": ("vieni", "come!", "Come here for a moment!", "Vieni qui un momento!"),
        "tenses": {
            "present.indicative": [
                ("vengo", "I come", "I come to class every day", "Vengo a lezione ogni giorno"),
                ("vieni", "you come", "Are you coming to the cinema tonight?", "Vieni al cinema stasera?"),
                ("viene", "he/she/it comes", "My sister comes home late", "Mia sorella viene a casa tardi"),
                ("veniamo", "we come", "We come from Naples", "Veniamo da Napoli"),
                ("venite", "you all come", "Are you all coming to the wedding?", "Venite al matrimonio?"),
                ("vengono", "they come", "They come every Sunday for lunch", "Vengono ogni domenica a pranzo"),
            ],
            "imperfect.indicative": [
                ("venivo", "I used to come", "I used to come here as a child", "Venivo qui da bambino"),
                ("venivi", "you used to come", "Did you use to come to school by bike?", "Venivi a scuola in bici?"),
                ("veniva", "he/she used to come", "Grandma used to come every August", "La nonna veniva ogni agosto"),
                ("venivamo", "we used to come", "We used to come to this beach in summer", "Venivamo su questa spiaggia d'estate"),
                ("venivate", "you all used to come", "Did you all use to come by car?", "Venivate in macchina?"),
                ("venivano", "they used to come", "They used to come to visit us often", "Venivano spesso a trovarci"),
            ],
            "future.indicative": [
                ("verrò", "I will come", "I will come to the airport to pick you up", "Verrò in aeroporto a prenderti"),
                ("verrai", "you will come", "Will you come to the concert with us?", "Verrai al concerto con noi?"),
                ("verrà", "he/she/it will come", "The plumber will come tomorrow morning", "L'idraulico verrà domani mattina"),
                ("verremo", "we will come", "We will come to see you next week", "Verremo a trovarti la prossima settimana"),
                ("verrete", "you all will come", "Will you all come to the meeting?", "Verrete alla riunione?"),
                ("verranno", "they will come", "Our friends will come for Christmas", "I nostri amici verranno per Natale"),
            ],
            "conditional": [
                ("verrei", "I would come", "I would gladly come with you", "Verrei volentieri con te"),
                ("verresti", "you would come", "Would you come with me to the doctor?", "Verresti con me dal medico?"),
                ("verrebbe", "he/she/it would come", "She would come if she had more time", "Verrebbe se avesse più tempo"),
                ("verremmo", "we would come", "We would come by train", "Verremmo in treno"),
                ("verreste", "you all would come", "Would you all come to visit the museum?", "Verreste a visitare il museo?"),
                ("verrebbero", "they would come", "They would come more often if they could", "Verrebbero più spesso se potessero"),
            ],
            "present.subjunctive": [
                ("venga", "(that) I come", "They want me to come early", "Vogliono che io venga presto"),
                ("venga", "(that) you come", "It is better that you come with us", "È meglio che tu venga con noi"),
                ("venga", "(that) he/she come", "I hope that he comes to the party", "Spero che venga alla festa"),
                ("veniamo", "(that) we come", "She wants us to come for dinner", "Vuole che veniamo a cena"),
                ("veniate", "(that) you all come", "I ask that you all come on time", "Chiedo che veniate puntuali"),
                ("vengano", "(that) they come", "I hope that they come together", "Spero che vengano insieme"),
            ],
        },
    },
    {
        "lemma": "potere", "suffix": "ere", "regularity": "irregular", "priority": 13,
        "nonfinite": {
            "infinitive": ("potere", "to be able to / can", "I would like to be able to help you", "Vorrei potere aiutarti"),
            "gerund": ("potendo", "being able", "Being able to rest, I feel better", "Potendo riposare, mi sento meglio"),
            "participle": ("potuto", "been able", "I have not been able to sleep", "Non ho potuto dormire"),
        },
        "tenses": {
            "present.indicative": [
                ("posso", "I can", "I can help you with the bags", "Posso aiutarti con le borse"),
                ("puoi", "you can", "Can you open the window?", "Puoi aprire la finestra?"),
                ("può", "he/she/it can", "She can speak three languages", "Lei può parlare tre lingue"),
                ("possiamo", "we can", "We can meet tomorrow morning", "Possiamo incontrarci domani mattina"),
                ("potete", "you all can", "Can you all wait five minutes?", "Potete aspettare cinque minuti?"),
                ("possono", "they can", "They can come whenever they want", "Possono venire quando vogliono"),
            ],
            "imperfect.indicative": [
                ("potevo", "I was able to", "As a child I was able to run fast", "Da bambino potevo correre veloce"),
                ("potevi", "you were able to", "You were able to help me back then", "Potevi aiutarmi allora"),
                ("poteva", "he/she was able to", "He was not able to come to the meeting", "Non poteva venire alla riunione"),
                ("potevamo", "we were able to", "We were able to see the sea from the window", "Potevamo vedere il mare dalla finestra"),
                ("potevate", "you all were able to", "Were you all able to finish the exam?", "Potevate finire l'esame?"),
                ("potevano", "they were able to", "They were not able to find the hotel", "Non potevano trovare l'albergo"),
            ],
            "future.indicative": [
                ("potrò", "I will be able to", "I will be able to call you tonight", "Potrò chiamarti stasera"),
                ("potrai", "you will be able to", "You will be able to rest this weekend", "Potrai riposare questo fine settimana"),
                ("potrà", "he/she/it will be able to", "The doctor will be able to see you at three", "Il dottore potrà riceverti alle tre"),
                ("potremo", "we will be able to", "We will be able to travel next summer", "Potremo viaggiare la prossima estate"),
                ("potrete", "you all will be able to", "You all will be able to visit the museum for free", "Potrete visitare il museo gratis"),
                ("potranno", "they will be able to", "They will be able to leave early tomorrow", "Potranno partire presto domani"),
            ],
            "conditional": [
                ("potrei", "I could", "I could try to fix it myself", "Potrei provare a ripararlo io"),
                ("potresti", "you could", "Could you pass me the salt?", "Potresti passarmi il sale?"),
                ("potrebbe", "he/she/it could", "It could rain this afternoon", "Potrebbe piovere questo pomeriggio"),
                ("potremmo", "we could", "We could go out for a walk", "Potremmo uscire a fare una passeggiata"),
                ("potreste", "you all could", "Could you all lower your voices?", "Potreste abbassare la voce?"),
                ("potrebbero", "they could", "They could arrive at any moment", "Potrebbero arrivare da un momento all'altro"),
            ],
            "present.subjunctive": [
                ("possa", "(that) I can", "I doubt that I can finish today", "Dubito che io possa finire oggi"),
                ("possa", "(that) you can", "I hope that you can come tomorrow", "Spero che tu possa venire domani"),
                ("possa", "(that) he/she can", "I hope that he can rest a little", "Spero che possa riposare un po'"),
                ("possiamo", "(that) we can", "She hopes that we can help her", "Spera che possiamo aiutarla"),
                ("possiate", "(that) you all can", "I hope that you all can understand me", "Spero che possiate capirmi"),
                ("possano", "(that) they can", "I doubt that they can arrive on time", "Dubito che possano arrivare in orario"),
            ],
        },
    },
    {
        "lemma": "volere", "suffix": "ere", "regularity": "irregular", "priority": 14,
        "nonfinite": {
            "infinitive": ("volere", "to want", "It is not enough to want, you also need to act", "Non basta volere, bisogna anche agire"),
            "gerund": ("volendo", "wanting", "Wanting to help, I called immediately", "Volendo aiutare, ho chiamato subito"),
            "participle": ("voluto", "wanted", "I have always wanted a dog", "Ho sempre voluto un cane"),
        },
        "tenses": {
            "present.indicative": [
                ("voglio", "I want", "I want an espresso, please", "Voglio un espresso, per favore"),
                ("vuoi", "you want", "Do you want to come with us?", "Vuoi venire con noi?"),
                ("vuole", "he/she/it wants", "My brother wants a new bike", "Mio fratello vuole una bici nuova"),
                ("vogliamo", "we want", "We want to visit Florence this summer", "Vogliamo visitare Firenze quest'estate"),
                ("volete", "you all want", "Do you all want more bread?", "Volete altro pane?"),
                ("vogliono", "they want", "They want to change apartment", "Vogliono cambiare appartamento"),
            ],
            "imperfect.indicative": [
                ("volevo", "I wanted", "I wanted to call you this morning", "Volevo chiamarti stamattina"),
                ("volevi", "you wanted", "What did you want to tell me?", "Cosa volevi dirmi?"),
                ("voleva", "he/she wanted", "She wanted a bigger house", "Voleva una casa più grande"),
                ("volevamo", "we wanted", "We wanted to leave earlier", "Volevamo partire prima"),
                ("volevate", "you all wanted", "What did you all want for dinner?", "Cosa volevate per cena?"),
                ("volevano", "they wanted", "They wanted more information", "Volevano più informazioni"),
            ],
            "future.indicative": [
                ("vorrò", "I will want", "One day I will want to go back there", "Un giorno vorrò tornare lì"),
                ("vorrai", "you will want", "You will want a break after this trip", "Vorrai una pausa dopo questo viaggio"),
                ("vorrà", "he/she/it will want", "He will want an explanation", "Vorrà una spiegazione"),
                ("vorremo", "we will want", "We will want more time to decide", "Vorremo più tempo per decidere"),
                ("vorrete", "you all will want", "You all will want to see the photos", "Vorrete vedere le foto"),
                ("vorranno", "they will want", "They will want to know the truth", "Vorranno sapere la verità"),
            ],
            "conditional": [
                ("vorrei", "I would like", "I would like a coffee, please", "Vorrei un caffè, per favore"),
                ("vorresti", "you would like", "Would you like to dance?", "Vorresti ballare?"),
                ("vorrebbe", "he/she/it would like", "She would like more information", "Vorrebbe più informazioni"),
                ("vorremmo", "we would like", "We would like a table for four", "Vorremmo un tavolo per quattro"),
                ("vorreste", "you all would like", "Would you all like something to drink?", "Vorreste qualcosa da bere?"),
                ("vorrebbero", "they would like", "They would like to stay longer", "Vorrebbero restare più a lungo"),
            ],
            "present.subjunctive": [
                ("voglia", "(that) I want", "It seems that I want too much", "Sembra che io voglia troppo"),
                ("voglia", "(that) you want", "I hope that you want to stay", "Spero che tu voglia restare"),
                ("voglia", "(that) he/she want", "I doubt that he wants to help", "Dubito che voglia aiutare"),
                ("vogliamo", "(that) we want", "They think that we want too much", "Pensano che vogliamo troppo"),
                ("vogliate", "(that) you all want", "I hope that you all want to participate", "Spero che vogliate partecipare"),
                ("vogliano", "(that) they want", "I doubt that they want to leave", "Dubito che vogliano partire"),
            ],
        },
    },
    {
        "lemma": "dovere", "suffix": "ere", "regularity": "irregular", "priority": 15,
        "nonfinite": {
            "infinitive": ("dovere", "to have to / must", "I don't like always having to ask permission", "Non mi piace dovere sempre chiedere il permesso"),
            "gerund": ("dovendo", "having to", "Having to leave early, I woke up at five", "Dovendo partire presto, mi sono svegliato alle cinque"),
            "participle": ("dovuto", "had to", "I have had to change my plans", "Ho dovuto cambiare i miei piani"),
        },
        "tenses": {
            "present.indicative": [
                ("devo", "I must", "I must study for tomorrow's exam", "Devo studiare per l'esame di domani"),
                ("devi", "you must", "You must rest a little", "Devi riposare un po'"),
                ("deve", "he/she/it must", "He must finish the report today", "Deve finire il rapporto oggi"),
                ("dobbiamo", "we must", "We must leave in ten minutes", "Dobbiamo partire tra dieci minuti"),
                ("dovete", "you all must", "You all must be more careful", "Dovete stare più attenti"),
                ("devono", "they must", "They must pay the bill by Friday", "Devono pagare il conto entro venerdì"),
            ],
            "imperfect.indicative": [
                ("dovevo", "I had to", "I had to work every Saturday", "Dovevo lavorare ogni sabato"),
                ("dovevi", "you had to", "You had to tell me sooner", "Dovevi dirmelo prima"),
                ("doveva", "he/she had to", "She had to leave the meeting early", "Doveva lasciare la riunione presto"),
                ("dovevamo", "we had to", "We had to change trains twice", "Dovevamo cambiare treno due volte"),
                ("dovevate", "you all had to", "Did you all have to wait long?", "Dovevate aspettare tanto?"),
                ("dovevano", "they had to", "They had to sell the old car", "Dovevano vendere la vecchia macchina"),
            ],
            "future.indicative": [
                ("dovrò", "I will have to", "I will have to call the plumber", "Dovrò chiamare l'idraulico"),
                ("dovrai", "you will have to", "You will have to wake up earlier", "Dovrai svegliarti prima"),
                ("dovrà", "he/she/it will have to", "She will have to repeat the year", "Dovrà ripetere l'anno"),
                ("dovremo", "we will have to", "We will have to book the hotel soon", "Dovremo prenotare l'albergo presto"),
                ("dovrete", "you all will have to", "You all will have to show your documents", "Dovrete mostrare i documenti"),
                ("dovranno", "they will have to", "They will have to wait outside", "Dovranno aspettare fuori"),
            ],
            "conditional": [
                ("dovrei", "I should", "I should call my mother tonight", "Dovrei chiamare mia madre stasera"),
                ("dovresti", "you should", "You should see a doctor", "Dovresti vedere un medico"),
                ("dovrebbe", "he/she/it should", "He should apologize to her", "Dovrebbe chiederle scusa"),
                ("dovremmo", "we should", "We should leave right now", "Dovremmo partire subito"),
                ("dovreste", "you all should", "You all should try this restaurant", "Dovreste provare questo ristorante"),
                ("dovrebbero", "they should", "They should arrive before six", "Dovrebbero arrivare prima delle sei"),
            ],
            "present.subjunctive": [
                ("debba", "(that) I must", "I don't think that I must apologize", "Non penso che io debba scusarmi"),
                ("debba", "(that) you must", "It seems that you must leave now", "Sembra che tu debba partire adesso"),
                ("debba", "(that) he/she must", "I doubt that he must pay again", "Dubito che debba pagare di nuovo"),
                ("dobbiamo", "(that) we must", "It is clear that we must change strategy", "È chiaro che dobbiamo cambiare strategia"),
                ("dobbiate", "(that) you all must", "I hope that you all don't have to wait long", "Spero che non dobbiate aspettare tanto"),
                ("debbano", "(that) they must", "I doubt that they must leave so soon", "Dubito che debbano partire così presto"),
            ],
        },
    },
    {
        "lemma": "sapere", "suffix": "ere", "regularity": "irregular", "priority": 16,
        "nonfinite": {
            "infinitive": ("sapere", "to know", "I would like to know the truth", "Vorrei sapere la verità"),
            "gerund": ("sapendo", "knowing", "Knowing the risk, I decided not to go", "Sapendo il rischio, ho deciso di non andare"),
            "participle": ("saputo", "known", "I have never known his real name", "Non ho mai saputo il suo vero nome"),
        },
        "imperative": ("sappi", "know!", "Know that I am always here for you", "Sappi che sono sempre qui per te"),
        "tenses": {
            "present.indicative": [
                ("so", "I know", "I know the answer to this question", "So la risposta a questa domanda"),
                ("sai", "you know", "Do you know what time it is?", "Sai che ore sono?"),
                ("sa", "he/she/it knows", "She knows how to cook very well", "Lei sa cucinare molto bene"),
                ("sappiamo", "we know", "We know the way to the station", "Sappiamo la strada per la stazione"),
                ("sapete", "you all know", "Do you all know the address?", "Sapete l'indirizzo?"),
                ("sanno", "they know", "They know the whole story", "Sanno tutta la storia"),
            ],
            "imperfect.indicative": [
                ("sapevo", "I knew", "I knew the answer but I said nothing", "Sapevo la risposta ma non ho detto niente"),
                ("sapevi", "you knew", "Did you know that she was leaving?", "Sapevi che partiva?"),
                ("sapeva", "he/she knew", "He already knew the result", "Sapeva già il risultato"),
                ("sapevamo", "we knew", "We knew nothing about the plan", "Non sapevamo niente del piano"),
                ("sapevate", "you all knew", "Did you all know the news already?", "Sapevate già la notizia?"),
                ("sapevano", "they knew", "They knew the truth from the beginning", "Sapevano la verità fin dall'inizio"),
            ],
            "future.indicative": [
                ("saprò", "I will know", "I will know the results tomorrow", "Saprò i risultati domani"),
                ("saprai", "you will know", "You will know soon enough", "Saprai abbastanza presto"),
                ("saprà", "he/she/it will know", "The teacher will know how to help you", "Il professore saprà come aiutarti"),
                ("sapremo", "we will know", "We will know more after the meeting", "Sapremo di più dopo la riunione"),
                ("saprete", "you all will know", "You all will know everything at the end", "Saprete tutto alla fine"),
                ("sapranno", "they will know", "They will know the address by tomorrow", "Sapranno l'indirizzo entro domani"),
            ],
            "conditional": [
                ("saprei", "I would know", "I would not know how to answer", "Non saprei come rispondere"),
                ("sapresti", "you would know", "Would you know how to fix this computer?", "Sapresti riparare questo computer?"),
                ("saprebbe", "he/she/it would know", "She would know exactly what to do", "Saprebbe esattamente cosa fare"),
                ("sapremmo", "we would know", "We would not know where to start", "Non sapremmo da dove iniziare"),
                ("sapreste", "you all would know", "Would you all know how to get there?", "Sapreste come arrivarci?"),
                ("saprebbero", "they would know", "They would know how to solve the problem", "Saprebbero come risolvere il problema"),
            ],
            "present.subjunctive": [
                ("sappia", "(that) I know", "It is important that I know the rules", "È importante che io sappia le regole"),
                ("sappia", "(that) you know", "I want you to know the truth", "Voglio che tu sappia la verità"),
                ("sappia", "(that) he/she know", "I hope that he knows the way", "Spero che sappia la strada"),
                ("sappiamo", "(that) we know", "It is necessary that we know the schedule", "È necessario che sappiamo l'orario"),
                ("sappiate", "(that) you all know", "I want you all to know the risks", "Voglio che sappiate i rischi"),
                ("sappiano", "(that) they know", "I hope that they know the address", "Spero che sappiano l'indirizzo"),
            ],
        },
    },
]


def read_entities(fpath):
    content = open(fpath).read()
    raw = content.replace("export default ", "").rstrip().rstrip(";")
    raw = re.sub(r'(?<=\n)\s*(\w[\w-]*)(?=\s*:)', lambda m: f'  "{m.group(1)}"', raw)
    raw = re.sub(r",(\s*[}\]])", r"\1", raw)
    return json.loads(raw)


def write_entities(fpath, entities):
    body = json.dumps(entities, indent=2, ensure_ascii=False)
    with open(fpath, "w") as f:
        f.write(f"export default {body}\n")


def symbol(slug):
    return {"slug": slug}


def base_symbols(verb, form_kind):
    return [
        symbol("word"),
        symbol(f"word.lemma.{verb['lemma']}"),
        symbol("word.part-of-speech.verb"),
        symbol(f"word.suffix.{verb['suffix']}"),
        symbol(f"word.regularity.{verb['regularity']}"),
        symbol(f"word.verb-form.{form_kind}"),
    ]


def proficiency(high_frequency=False):
    out = [symbol("proficiency.cefr.a1"), symbol("proficiency.survival")]
    if high_frequency:
        out.append(symbol("proficiency.high-frequency"))
    return out


def entity(slug, learning, known, known_example, learning_example, symbols):
    return {
        "slug": slug,
        "traits": ["TRANSLATED", "EXEMPLIFIED"],
        "trait": {
            "TRANSLATED": {"known": known, "learning": learning},
            "EXEMPLIFIED": {"known": known_example, "learning": learning_example},
        },
        "symbols": symbols,
    }


word_entities = []
bundles = []
for verb in VERBS:
    lemma = verb["lemma"]
    for kind, tail in [("infinitive", "infinitive"), ("gerund", "gerund"), ("participle", "participle.past")]:
        learning, known, known_example, learning_example = verb["nonfinite"][kind]
        word_entities.append(entity(
            f"{lemma}.verb.{tail}", learning, known, known_example, learning_example,
            base_symbols(verb, kind) + proficiency(kind == "infinitive"),
        ))
    for tense_key, rows in verb["tenses"].items():
        parts = tense_key.split(".")
        tense, mood = (parts[0], parts[1]) if len(parts) == 2 else (None, parts[0])
        for (person, number), (learning, known, known_example, learning_example) in zip(CELLS, rows):
            if mood == "conditional":
                slug = f"{lemma}.verb.conditional.{person}.{number}"
                grammar = [symbol("word.mood.conditional")]
            else:
                slug = f"{lemma}.verb.{mood}.{tense}.{person}.{number}"
                grammar = [symbol(f"word.mood.{mood}"), symbol(f"word.tense.{tense}")]
            grammar += [symbol(f"word.person.{person}"), symbol(f"word.number.{number}"), symbol("word.voice.active")]
            high_frequency = tense_key == "present.indicative"
            word_entities.append(entity(
                slug, learning, known, known_example, learning_example,
                base_symbols(verb, "finite") + grammar + proficiency(high_frequency),
            ))
    if "imperative" in verb:
        learning, known, known_example, learning_example = verb["imperative"]
        word_entities.append(entity(
            f"{lemma}.verb.imperative.second.singular", learning, known, known_example, learning_example,
            base_symbols(verb, "finite") + [
                symbol("word.mood.imperative"), symbol("word.person.second"), symbol("word.number.singular"),
            ] + proficiency(),
        ))

for tense_key, mood_label in [("present.indicative", "indicative"), ("imperfect.indicative", "indicative"),
                              ("future.indicative", "indicative"), ("conditional", "conditional"),
                              ("present.subjunctive", "subjunctive")]:
    for verb in VERBS:
        lemma = verb["lemma"]
        parts = tense_key.split(".")
        tense = parts[0] if len(parts) == 2 else None
        if tense_key == "conditional":
            bundle_slug = f"{lemma}.conditional"
            cell = lambda person, number: f"{lemma}.verb.conditional.{person}.{number}"
            grammar = [symbol("word.mood.conditional")]
        else:
            mood = parts[1]
            bundle_slug = f"{lemma}.{tense}.{mood}"
            cell = lambda person, number, m=mood, t=tense: f"{lemma}.verb.{m}.{t}.{person}.{number}"
            grammar = [symbol(f"word.mood.{mood}"), symbol(f"word.tense.{tense}")]
        bundles.append({
            "slug": bundle_slug,
            "traits": ["RANKED", "CONJUGATED"],
            "trait": {
                "RANKED": {"rank": 0},
                "CONJUGATED": {
                    "infinitive": f"{lemma}.verb.infinitive",
                    "paradigm": {slot: cell(person, number) for slot, (person, number) in zip(SLOTS, CELLS)},
                },
            },
            "symbols": [symbol("conjugation"), symbol(f"word.lemma.{lemma}")] + grammar + [
                symbol(f"word.suffix.{verb['suffix']}"), symbol(f"word.regularity.{verb['regularity']}"),
                symbol("proficiency.survival"), symbol("proficiency.cefr.a1"),
            ],
        })

existing_words = read_entities(f"{BASE}/words/verb.js")
existing_lemmas = {e["slug"].split(".")[0] for e in existing_words}
fresh = [e for e in word_entities if e["slug"].split(".")[0] not in existing_lemmas]
write_entities(f"{BASE}/words/verb.js", existing_words + fresh)

existing_bundles = read_entities(f"{BASE}/conjugation.js")
existing_bundle_slugs = {e["slug"] for e in existing_bundles}
fresh_bundles = [b for b in bundles if b["slug"] not in existing_bundle_slugs]
for offset, bundle in enumerate(fresh_bundles):
    bundle["trait"]["RANKED"]["rank"] = len(existing_bundles) + offset + 1
write_entities(f"{BASE}/conjugation.js", existing_bundles + fresh_bundles)

print(f"verb literals +{len(fresh)} (total {len(existing_words) + len(fresh)}), bundles +{len(fresh_bundles)} (total {len(existing_bundles) + len(fresh_bundles)})")
