import { Freight } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { join } from "@std/path";

export const carry = async (mode, host, root) => {
  await paladin.state.dir(root);
  const files = await paladin.find.walk(/./, mode.statics?.ignore)(root);
  mode.freight = new Freight(root).stow(files.map((file) => file.absolute.slice(root.length + 1)));
  mode.freight.withUrl(host.attach.branch("/cargo").branch(host.reference.nature));
  mode.freight.receive = async (path, bytes) => {
    await paladin.state.store(`${root}/${path}`, bytes);
    return mode.freight.admit(path).resolve(path);
  };
  mode.aperture.open("/freight", () => mode.freight.catalog);
};

export const FRAUGHT = (mode, host) => carry(mode, host, join(mode.module.source.dirname, mode.module.freight.path.nature));
