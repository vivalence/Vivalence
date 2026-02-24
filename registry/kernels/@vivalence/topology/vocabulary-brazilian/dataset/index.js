import schema from "./schema.json" with { type: "json" };

// import entities from "./entities.json" with { type: "json" };
// import verbs from "./verbs.json" with { type: "json" };

export default {
  schema,
  entities: {
    literal: [
      {
        annotation: { gender: "masc", lemma: "gato", number: "sing", pos: "noun" },
        slug: "gender.masc~lemma.gato~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        data: {
          TRANSLATED: { known: "cat", learning: "gato" },
          EXEMPLIFIED: { known: "The cat is small", learning: "O gato é pequeno" },
        },
      },
      {
        slug: "lemma.ser~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "ser",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to be (permanent)", learning: "ser" },
          EXEMPLIFIED: { known: "I am a student", learning: "Eu sou estudante" },
        },
      },
      {
        slug: "lemma.estar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "estar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to be (temporary)", learning: "estar" },
          EXEMPLIFIED: { known: "I am tired today", learning: "Eu estou cansado hoje" },
        },
      },
      {
        slug: "lemma.ter~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "ter",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to have", learning: "ter" },
          EXEMPLIFIED: { known: "I have a dog", learning: "Eu tenho um cachorro" },
        },
      },
      {
        slug: "lemma.fazer~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "fazer",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to do / make", learning: "fazer" },
          EXEMPLIFIED: { known: "I make dinner every day", learning: "Eu faço o jantar todo dia" },
        },
      },
      {
        slug: "lemma.ir~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "ir",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to go", learning: "ir" },
          EXEMPLIFIED: { known: "I go to work by bus", learning: "Eu vou ao trabalho de ônibus" },
        },
      },
      {
        slug: "lemma.poder~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "poder",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "can / to be able to", learning: "poder" },
          EXEMPLIFIED: { known: "I can help you", learning: "Eu posso te ajudar" },
        },
      },
      {
        slug: "lemma.dizer~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "dizer",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to say", learning: "dizer" },
          EXEMPLIFIED: { known: "I say the truth", learning: "Eu digo a verdade" },
        },
      },
      {
        slug: "lemma.dar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "dar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to give", learning: "dar" },
          EXEMPLIFIED: { known: "I give him a gift", learning: "Eu dou um presente pra ele" },
        },
      },
      {
        slug: "lemma.ver~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "ver",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to see", learning: "ver" },
          EXEMPLIFIED: { known: "I see the mountains", learning: "Eu vejo as montanhas" },
        },
      },
      {
        slug: "lemma.saber~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "saber",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to know (a fact)", learning: "saber" },
          EXEMPLIFIED: { known: "I know the answer", learning: "Eu sei a resposta" },
        },
      },
      {
        slug: "lemma.querer~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "querer",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to want", learning: "querer" },
          EXEMPLIFIED: { known: "I want a coffee", learning: "Eu quero um café" },
        },
      },
      // remaining verbs
      {
        slug: "lemma.vir~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "vir",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to come", learning: "vir" },
          EXEMPLIFIED: { known: "I come from São Paulo", learning: "Eu venho de São Paulo" },
        },
      },
      {
        slug: "lemma.falar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "falar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to speak / talk", learning: "falar" },
          EXEMPLIFIED: { known: "I speak Portuguese", learning: "Eu falo português" },
        },
      },
      {
        slug: "lemma.ficar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "ficar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to stay / to become", learning: "ficar" },
          EXEMPLIFIED: {
            known: "I stay home on Sundays",
            learning: "Eu fico em casa nos domingos",
          },
        },
      },
      {
        slug: "lemma.deixar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "deixar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to let / leave", learning: "deixar" },
          EXEMPLIFIED: { known: "I leave my keys here", learning: "Eu deixo as chaves aqui" },
        },
      },
      {
        slug: "lemma.passar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "passar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to pass", learning: "passar" },
          EXEMPLIFIED: {
            known: "I pass by the market every day",
            learning: "Eu passo pelo mercado todo dia",
          },
        },
      },
      {
        slug: "lemma.precisar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "precisar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to need", learning: "precisar" },
          EXEMPLIFIED: { known: "I need more time", learning: "Eu preciso de mais tempo" },
        },
      },
      {
        slug: "lemma.trazer~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "trazer",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to bring", learning: "trazer" },
          EXEMPLIFIED: { known: "I bring lunch from home", learning: "Eu trago o almoço de casa" },
        },
      },
      {
        slug: "lemma.achar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "achar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to find / to think", learning: "achar" },
          EXEMPLIFIED: { known: "I think it is good", learning: "Eu acho que é bom" },
        },
      },
      {
        slug: "lemma.começar~mood.ind~number.sing~person.1~pos.verb~tense.pres~verbform.fin~voice.act",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          lemma: "começar",
          mood: "ind",
          number: "sing",
          person: "1",
          pos: "verb",
          tense: "pres",
          verbform: "fin",
          voice: "act",
        },
        data: {
          TRANSLATED: { known: "to begin", learning: "começar" },
          EXEMPLIFIED: {
            known: "I start work at eight",
            learning: "Eu começo a trabalhar às oito",
          },
        },
      },

      // determiners
      {
        slug: "gender.masc~lemma.o~number.sing~pos.det~prontype.art",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "o", number: "sing", pos: "det", prontype: "art" },
        data: {
          TRANSLATED: { known: "the (masc. sing.)", learning: "o" },
          EXEMPLIFIED: { known: "The boy is here", learning: "O menino está aqui" },
        },
      },
      {
        slug: "gender.fem~lemma.a~number.sing~pos.det~prontype.art",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "a", number: "sing", pos: "det", prontype: "art" },
        data: {
          TRANSLATED: { known: "the (fem. sing.)", learning: "a" },
          EXEMPLIFIED: { known: "The house is big", learning: "A casa é grande" },
        },
      },
      {
        slug: "gender.masc~lemma.um~number.sing~pos.det~prontype.art",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "um", number: "sing", pos: "det", prontype: "art" },
        data: {
          TRANSLATED: { known: "a / an (masc.)", learning: "um" },
          EXEMPLIFIED: { known: "A dog is in the park", learning: "Um cachorro está no parque" },
        },
      },
      {
        slug: "gender.fem~lemma.uma~number.sing~pos.det~prontype.art",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "uma", number: "sing", pos: "det", prontype: "art" },
        data: {
          TRANSLATED: { known: "a / an (fem.)", learning: "uma" },
          EXEMPLIFIED: { known: "A woman called", learning: "Uma mulher ligou" },
        },
      },
      {
        slug: "gender.masc~lemma.esse~number.sing~pos.det~prontype.dem",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "esse", number: "sing", pos: "det", prontype: "dem" },
        data: {
          TRANSLATED: { known: "this / that (masc. BR)", learning: "esse" },
          EXEMPLIFIED: { known: "That guy is my friend", learning: "Esse cara é meu amigo" },
        },
      },
      {
        slug: "gender.fem~lemma.essa~number.sing~pos.det~prontype.dem",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "essa", number: "sing", pos: "det", prontype: "dem" },
        data: {
          TRANSLATED: { known: "this / that (fem. BR)", learning: "essa" },
          EXEMPLIFIED: { known: "That idea is good", learning: "Essa ideia é boa" },
        },
      },
      {
        slug: "gender.masc~lemma.meu~number.sing~pos.det~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "meu", number: "sing", pos: "det", prontype: "prs" },
        data: {
          TRANSLATED: { known: "my (masc.)", learning: "meu" },
          EXEMPLIFIED: { known: "My brother lives here", learning: "Meu irmão mora aqui" },
        },
      },
      {
        slug: "gender.fem~lemma.minha~number.sing~pos.det~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "minha", number: "sing", pos: "det", prontype: "prs" },
        data: {
          TRANSLATED: { known: "my (fem.)", learning: "minha" },
          EXEMPLIFIED: {
            known: "My mother works downtown",
            learning: "Minha mãe trabalha no centro",
          },
        },
      },
      {
        slug: "gender.masc~lemma.seu~number.sing~pos.det~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "seu", number: "sing", pos: "det", prontype: "prs" },
        data: {
          TRANSLATED: { known: "your / his / her (masc.)", learning: "seu" },
          EXEMPLIFIED: { known: "Your car is outside", learning: "Seu carro está lá fora" },
        },
      },
      {
        slug: "gender.masc~lemma.cada~number.sing~pos.det~prontype.tot",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "cada", number: "sing", pos: "det", prontype: "tot" },
        data: {
          TRANSLATED: { known: "each / every", learning: "cada" },
          EXEMPLIFIED: { known: "Each person has a name", learning: "Cada pessoa tem um nome" },
        },
      },
      {
        slug: "gender.masc~lemma.outro~number.sing~pos.det~prontype.ind",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "outro", number: "sing", pos: "det", prontype: "ind" },
        data: {
          TRANSLATED: { known: "other / another", learning: "outro" },
          EXEMPLIFIED: { known: "I want another coffee", learning: "Eu quero outro café" },
        },
      },

      // pronouns
      {
        slug: "lemma.eu~number.sing~person.1~pos.pron~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "eu", number: "sing", person: "1", pos: "pron", prontype: "prs" },
        data: {
          TRANSLATED: { known: "I", learning: "eu" },
          EXEMPLIFIED: { known: "I am hungry", learning: "Eu estou com fome" },
        },
      },
      {
        slug: "lemma.você~number.sing~person.2~pos.pron~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "você", number: "sing", person: "2", pos: "pron", prontype: "prs" },
        data: {
          TRANSLATED: { known: "you (BR informal)", learning: "você" },
          EXEMPLIFIED: { known: "Are you okay?", learning: "Você está bem?" },
        },
      },
      {
        slug: "gender.masc~lemma.ele~number.sing~person.3~pos.pron~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          gender: "masc",
          lemma: "ele",
          number: "sing",
          person: "3",
          pos: "pron",
          prontype: "prs",
        },
        data: {
          TRANSLATED: { known: "he", learning: "ele" },
          EXEMPLIFIED: { known: "He works a lot", learning: "Ele trabalha muito" },
        },
      },
      {
        slug: "gender.fem~lemma.ela~number.sing~person.3~pos.pron~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: {
          gender: "fem",
          lemma: "ela",
          number: "sing",
          person: "3",
          pos: "pron",
          prontype: "prs",
        },
        data: {
          TRANSLATED: { known: "she", learning: "ela" },
          EXEMPLIFIED: { known: "She is my sister", learning: "Ela é minha irmã" },
        },
      },
      {
        slug: "lemma.a_gente~number.plur~person.1~pos.pron~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "a_gente", number: "plur", person: "1", pos: "pron", prontype: "prs" },
        data: {
          TRANSLATED: { known: "we (BR colloquial)", learning: "a gente" },
          EXEMPLIFIED: { known: "We are going to the beach", learning: "A gente vai à praia" },
        },
      },
      {
        slug: "lemma.nós~number.plur~person.1~pos.pron~prontype.prs",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "nós", number: "plur", person: "1", pos: "pron", prontype: "prs" },
        data: {
          TRANSLATED: { known: "we (formal)", learning: "nós" },
          EXEMPLIFIED: { known: "We need to talk", learning: "Nós precisamos conversar" },
        },
      },
      {
        slug: "lemma.isso~pos.pron~prontype.dem",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "isso", pos: "pron", prontype: "dem" },
        data: {
          TRANSLATED: { known: "this / that (neuter)", learning: "isso" },
          EXEMPLIFIED: { known: "That is not true", learning: "Isso não é verdade" },
        },
      },
      {
        slug: "lemma.tudo~pos.pron~prontype.tot",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "tudo", pos: "pron", prontype: "tot" },
        data: {
          TRANSLATED: { known: "everything", learning: "tudo" },
          EXEMPLIFIED: { known: "Everything is fine", learning: "Tudo está bem" },
        },
      },
      {
        slug: "lemma.nada~pos.pron~prontype.neg",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "nada", pos: "pron", prontype: "neg" },
        data: {
          TRANSLATED: { known: "nothing", learning: "nada" },
          EXEMPLIFIED: { known: "I know nothing", learning: "Eu não sei nada" },
        },
      },
      {
        slug: "lemma.que~pos.pron~prontype.rel",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "que", pos: "pron", prontype: "rel" },
        data: {
          TRANSLATED: { known: "that / which / who", learning: "que" },
          EXEMPLIFIED: {
            known: "The book that I read is good",
            learning: "O livro que eu li é bom",
          },
        },
      },
      {
        slug: "lemma.se~pos.pron~prontype.prs~reflex.yes",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "se", pos: "pron", prontype: "prs", reflex: "yes" },
        data: {
          TRANSLATED: { known: "oneself / if", learning: "se" },
          EXEMPLIFIED: { known: "He hurt himself", learning: "Ele se machucou" },
        },
      },

      // adpositions
      {
        slug: "lemma.de~pos.adp",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "de", pos: "adp" },
        data: {
          TRANSLATED: { known: "of / from", learning: "de" },
          EXEMPLIFIED: { known: "I am from Brazil", learning: "Eu sou do Brasil" },
        },
      },
      {
        slug: "lemma.em~pos.adp",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "em", pos: "adp" },
        data: {
          TRANSLATED: { known: "in / at", learning: "em" },
          EXEMPLIFIED: { known: "I live in the city", learning: "Eu moro na cidade" },
        },
      },
      {
        slug: "lemma.para~pos.adp",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "para", pos: "adp" },
        data: {
          TRANSLATED: { known: "for / to", learning: "para" },
          EXEMPLIFIED: { known: "This is for you", learning: "Isso é pra você" },
        },
      },
      {
        slug: "lemma.com~pos.adp",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "com", pos: "adp" },
        data: {
          TRANSLATED: { known: "with", learning: "com" },
          EXEMPLIFIED: { known: "I go with my friend", learning: "Eu vou com meu amigo" },
        },
      },
      {
        slug: "lemma.por~pos.adp",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "por", pos: "adp" },
        data: {
          TRANSLATED: { known: "by / for / through", learning: "por" },
          EXEMPLIFIED: { known: "I walk through the park", learning: "Eu passo pelo parque" },
        },
      },
      {
        slug: "lemma.até~pos.adp",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "até", pos: "adp" },
        data: {
          TRANSLATED: { known: "until / even / up to", learning: "até" },
          EXEMPLIFIED: { known: "I work until six", learning: "Eu trabalho até as seis" },
        },
      },

      // conjunctions
      {
        slug: "lemma.e~pos.cconj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "e", pos: "cconj" },
        data: {
          TRANSLATED: { known: "and", learning: "e" },
          EXEMPLIFIED: { known: "Coffee and bread", learning: "Café e pão" },
        },
      },
      {
        slug: "lemma.mas~pos.cconj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "mas", pos: "cconj" },
        data: {
          TRANSLATED: { known: "but", learning: "mas" },
          EXEMPLIFIED: {
            known: "I want to go but I am tired",
            learning: "Eu quero ir mas estou cansado",
          },
        },
      },
      {
        slug: "lemma.porque~pos.sconj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "porque", pos: "sconj" },
        data: {
          TRANSLATED: { known: "because", learning: "porque" },
          EXEMPLIFIED: {
            known: "I stayed because it was raining",
            learning: "Eu fiquei porque estava chovendo",
          },
        },
      },
      {
        slug: "lemma.quando~pos.sconj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "quando", pos: "sconj" },
        data: {
          TRANSLATED: { known: "when", learning: "quando" },
          EXEMPLIFIED: { known: "Call me when you arrive", learning: "Me liga quando chegar" },
        },
      },
      {
        slug: "lemma.como~pos.sconj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "como", pos: "sconj" },
        data: {
          TRANSLATED: { known: "how / like / as", learning: "como" },
          EXEMPLIFIED: { known: "Do it like this", learning: "Faz como isso" },
        },
      },

      // adverbs
      {
        slug: "lemma.não~pos.adv~polarity.neg",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "não", pos: "adv", polarity: "neg" },
        data: {
          TRANSLATED: { known: "no / not", learning: "não" },
          EXEMPLIFIED: { known: "I do not know", learning: "Eu não sei" },
        },
      },
      {
        slug: "lemma.mais~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "mais", pos: "adv" },
        data: {
          TRANSLATED: { known: "more", learning: "mais" },
          EXEMPLIFIED: { known: "I want more water", learning: "Eu quero mais água" },
        },
      },
      {
        slug: "lemma.muito~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "muito", pos: "adv" },
        data: {
          TRANSLATED: { known: "very / a lot", learning: "muito" },
          EXEMPLIFIED: { known: "I like it a lot", learning: "Eu gosto muito" },
        },
      },
      {
        slug: "lemma.bem~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "bem", pos: "adv" },
        data: {
          TRANSLATED: { known: "well / fine", learning: "bem" },
          EXEMPLIFIED: { known: "I am doing well", learning: "Eu estou bem" },
        },
      },
      {
        slug: "lemma.já~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "já", pos: "adv" },
        data: {
          TRANSLATED: { known: "already / now", learning: "já" },
          EXEMPLIFIED: { known: "I already ate", learning: "Eu já comi" },
        },
      },
      {
        slug: "lemma.ainda~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "ainda", pos: "adv" },
        data: {
          TRANSLATED: { known: "still / yet", learning: "ainda" },
          EXEMPLIFIED: { known: "I still live here", learning: "Eu ainda moro aqui" },
        },
      },
      {
        slug: "lemma.só~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "só", pos: "adv" },
        data: {
          TRANSLATED: { known: "only / alone", learning: "só" },
          EXEMPLIFIED: { known: "I only have one", learning: "Eu só tenho um" },
        },
      },
      {
        slug: "lemma.então~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "então", pos: "adv" },
        data: {
          TRANSLATED: { known: "so / then", learning: "então" },
          EXEMPLIFIED: { known: "So what do we do?", learning: "Então o que a gente faz?" },
        },
      },
      {
        slug: "lemma.assim~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "assim", pos: "adv" },
        data: {
          TRANSLATED: { known: "like this / so", learning: "assim" },
          EXEMPLIFIED: { known: "Do it like this", learning: "Faz assim" },
        },
      },
      {
        slug: "lemma.aqui~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "aqui", pos: "adv" },
        data: {
          TRANSLATED: { known: "here", learning: "aqui" },
          EXEMPLIFIED: { known: "Come here", learning: "Vem aqui" },
        },
      },
      {
        slug: "lemma.lá~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "lá", pos: "adv" },
        data: {
          TRANSLATED: { known: "there", learning: "lá" },
          EXEMPLIFIED: { known: "He is over there", learning: "Ele está lá" },
        },
      },
      {
        slug: "lemma.agora~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "agora", pos: "adv" },
        data: {
          TRANSLATED: { known: "now", learning: "agora" },
          EXEMPLIFIED: { known: "I want it now", learning: "Eu quero agora" },
        },
      },
      {
        slug: "lemma.depois~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "depois", pos: "adv" },
        data: {
          TRANSLATED: { known: "after / later", learning: "depois" },
          EXEMPLIFIED: { known: "We talk later", learning: "A gente fala depois" },
        },
      },
      {
        slug: "lemma.antes~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "antes", pos: "adv" },
        data: {
          TRANSLATED: { known: "before", learning: "antes" },
          EXEMPLIFIED: { known: "Eat before you go", learning: "Come antes de sair" },
        },
      },
      {
        slug: "lemma.sempre~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "sempre", pos: "adv" },
        data: {
          TRANSLATED: { known: "always", learning: "sempre" },
          EXEMPLIFIED: { known: "I always drink coffee", learning: "Eu sempre tomo café" },
        },
      },
      {
        slug: "lemma.nunca~pos.adv~polarity.neg",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "nunca", polarity: "neg", pos: "adv" },
        data: {
          TRANSLATED: { known: "never", learning: "nunca" },
          EXEMPLIFIED: { known: "I never eat meat", learning: "Eu nunca como carne" },
        },
      },
      {
        slug: "lemma.talvez~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "talvez", pos: "adv" },
        data: {
          TRANSLATED: { known: "maybe", learning: "talvez" },
          EXEMPLIFIED: { known: "Maybe tomorrow", learning: "Talvez amanhã" },
        },
      },
      {
        slug: "lemma.também~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "também", pos: "adv" },
        data: {
          TRANSLATED: { known: "also / too", learning: "também" },
          EXEMPLIFIED: { known: "I want some too", learning: "Eu também quero" },
        },
      },
      {
        slug: "lemma.mesmo~pos.adv",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "mesmo", pos: "adv" },
        data: {
          TRANSLATED: { known: "same / even / really", learning: "mesmo" },
          EXEMPLIFIED: { known: "Are you serious?", learning: "Sério mesmo?" },
        },
      },

      // particles
      {
        slug: "lemma.sim~pos.part",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "sim", pos: "part" },
        data: {
          TRANSLATED: { known: "yes", learning: "sim" },
          EXEMPLIFIED: { known: "Yes, I want to go", learning: "Sim, eu quero ir" },
        },
      },
      {
        slug: "lemma.oi~pos.part",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "oi", pos: "part" },
        data: {
          TRANSLATED: { known: "hi (BR)", learning: "oi" },
          EXEMPLIFIED: { known: "Hi, how are you?", learning: "Oi, tudo bem?" },
        },
      },
      {
        slug: "lemma.tá~pos.part",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "tá", pos: "part" },
        data: {
          TRANSLATED: { known: "ok / alright (BR colloquial)", learning: "tá" },
          EXEMPLIFIED: { known: "Alright, let's go", learning: "Tá, vamos lá" },
        },
      },
      {
        slug: "lemma.obrigado~pos.part",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "obrigado", pos: "part" },
        data: {
          TRANSLATED: { known: "thank you", learning: "obrigado / obrigada" },
          EXEMPLIFIED: { known: "Thank you very much", learning: "Muito obrigado" },
        },
      },
      {
        slug: "lemma.por_favor~pos.part",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { lemma: "por_favor", pos: "part" },
        data: {
          TRANSLATED: { known: "please", learning: "por favor" },
          EXEMPLIFIED: { known: "A coffee please", learning: "Um café, por favor" },
        },
      },

      // nouns
      {
        slug: "gender.masc~lemma.dia~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "dia", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "day", learning: "dia" },
          EXEMPLIFIED: { known: "Today is a good day", learning: "Hoje é um bom dia" },
        },
      },
      {
        slug: "gender.masc~lemma.tempo~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "tempo", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "time / weather", learning: "tempo" },
          EXEMPLIFIED: { known: "I have no time", learning: "Eu não tenho tempo" },
        },
      },
      {
        slug: "gender.fem~lemma.vez~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "vez", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "time / instance", learning: "vez" },
          EXEMPLIFIED: { known: "One more time", learning: "Mais uma vez" },
        },
      },
      {
        slug: "gender.masc~lemma.ano~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "ano", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "year", learning: "ano" },
          EXEMPLIFIED: { known: "This year is different", learning: "Esse ano é diferente" },
        },
      },
      {
        slug: "gender.fem~lemma.hora~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "hora", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "hour / time of day", learning: "hora" },
          EXEMPLIFIED: { known: "What time is it?", learning: "Que horas são?" },
        },
      },
      {
        slug: "gender.fem~lemma.coisa~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "coisa", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "thing", learning: "coisa" },
          EXEMPLIFIED: {
            known: "I need to tell you something",
            learning: "Tenho uma coisa pra te falar",
          },
        },
      },
      {
        slug: "gender.fem~lemma.pessoa~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "pessoa", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "person", learning: "pessoa" },
          EXEMPLIFIED: { known: "She is a good person", learning: "Ela é uma boa pessoa" },
        },
      },
      {
        slug: "gender.fem~lemma.gente~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "gente", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "people", learning: "gente" },
          EXEMPLIFIED: {
            known: "There are a lot of people here",
            learning: "Tem muita gente aqui",
          },
        },
      },
      {
        slug: "gender.fem~lemma.casa~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "casa", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "house / home", learning: "casa" },
          EXEMPLIFIED: { known: "I am going home", learning: "Eu vou pra casa" },
        },
      },
      {
        slug: "gender.fem~lemma.vida~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "vida", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "life", learning: "vida" },
          EXEMPLIFIED: { known: "Life is short", learning: "A vida é curta" },
        },
      },
      {
        slug: "gender.masc~lemma.trabalho~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "trabalho", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "work / job", learning: "trabalho" },
          EXEMPLIFIED: { known: "I have a lot of work", learning: "Eu tenho muito trabalho" },
        },
      },
      {
        slug: "gender.masc~lemma.dinheiro~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "dinheiro", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "money", learning: "dinheiro" },
          EXEMPLIFIED: { known: "I have no money", learning: "Eu não tenho dinheiro" },
        },
      },
      {
        slug: "gender.masc~lemma.lugar~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "lugar", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "place", learning: "lugar" },
          EXEMPLIFIED: { known: "This is a beautiful place", learning: "Esse é um lugar bonito" },
        },
      },
      {
        slug: "gender.masc~lemma.mundo~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "mundo", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "world", learning: "mundo" },
          EXEMPLIFIED: { known: "The world is changing", learning: "O mundo está mudando" },
        },
      },
      {
        slug: "gender.masc~lemma.país~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "país", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "country", learning: "país" },
          EXEMPLIFIED: { known: "Brazil is a big country", learning: "O Brasil é um país grande" },
        },
      },
      {
        slug: "gender.fem~lemma.cidade~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "cidade", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "city", learning: "cidade" },
          EXEMPLIFIED: { known: "I love this city", learning: "Eu amo essa cidade" },
        },
      },
      {
        slug: "gender.fem~lemma.água~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "água", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "water", learning: "água" },
          EXEMPLIFIED: { known: "Can I have some water?", learning: "Pode me dar água?" },
        },
      },
      {
        slug: "gender.fem~lemma.comida~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "fem", lemma: "comida", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "food", learning: "comida" },
          EXEMPLIFIED: { known: "The food is delicious", learning: "A comida está deliciosa" },
        },
      },
      {
        slug: "gender.masc~lemma.nome~number.sing~pos.noun",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "nome", number: "sing", pos: "noun" },
        data: {
          TRANSLATED: { known: "name", learning: "nome" },
          EXEMPLIFIED: { known: "What is your name?", learning: "Qual é o seu nome?" },
        },
      },

      // adjectives
      {
        slug: "gender.masc~lemma.bom~number.sing~pos.adj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "bom", number: "sing", pos: "adj" },
        data: {
          TRANSLATED: { known: "good", learning: "bom / boa" },
          EXEMPLIFIED: { known: "It is a good idea", learning: "É uma boa ideia" },
        },
      },
      {
        slug: "gender.masc~lemma.grande~number.sing~pos.adj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "grande", number: "sing", pos: "adj" },
        data: {
          TRANSLATED: { known: "big / great", learning: "grande" },
          EXEMPLIFIED: { known: "That is a big problem", learning: "Isso é um problema grande" },
        },
      },
      {
        slug: "gender.masc~lemma.pequeno~number.sing~pos.adj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "pequeno", number: "sing", pos: "adj" },
        data: {
          TRANSLATED: { known: "small", learning: "pequeno / pequena" },
          EXEMPLIFIED: {
            known: "I live in a small apartment",
            learning: "Eu moro num apartamento pequeno",
          },
        },
      },
      {
        slug: "gender.masc~lemma.novo~number.sing~pos.adj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "novo", number: "sing", pos: "adj" },
        data: {
          TRANSLATED: { known: "new / young", learning: "novo / nova" },
          EXEMPLIFIED: { known: "I bought a new phone", learning: "Eu comprei um celular novo" },
        },
      },
      {
        slug: "gender.masc~lemma.primeiro~number.sing~pos.adj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "primeiro", number: "sing", pos: "adj" },
        data: {
          TRANSLATED: { known: "first", learning: "primeiro / primeira" },
          EXEMPLIFIED: { known: "This is the first time", learning: "Essa é a primeira vez" },
        },
      },
      {
        slug: "gender.masc~lemma.último~number.sing~pos.adj",
        traits: ["EXEMPLIFIED", "TRANSLATED"],
        annotation: { gender: "masc", lemma: "último", number: "sing", pos: "adj" },
        data: {
          TRANSLATED: { known: "last", learning: "último / última" },
          EXEMPLIFIED: { known: "This is the last chance", learning: "Essa é a última chance" },
        },
      },
    ],
  },
};
