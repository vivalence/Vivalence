import { annotations } from "./annotations";

import * as noun from "./pos/noun.js";
import * as verb from "./pos/verb.js";
import * as adj from "./pos/adj.js";
import * as adp from "./pos/adp.js";
import * as adv from "./pos/adv.js";
import * as cconj from "./pos/cconj.js";
import * as det from "./pos/det.js";
import * as intj from "./pos/intj.js";
import * as num from "./pos/num.js";
import * as pron from "./pos/pron.js";
import * as sconj from "./pos/sconj.js";
import * as punct from "./pos/punct.js";

const pos = {
    verb,
    aux: verb,
    noun,
    propn: noun,
    adj,
    punct,
    adp,
    adv,
    cconj,
    det,
    intj,
    num,
    pron,
    sconj
};

export { annotations, pos };
