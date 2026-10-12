import { Freight } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { join } from "@std/path";

export const carry = async (mode, context, root) => {
  await paladin.state.dir(root);
  const files = await paladin.find.walk(/./, mode.statics?.ignore)(root);
  mode.freight = new Freight(root).stow(files.map((file) => file.absolute.slice(root.length + 1)));
  mode.freight.withUrl(context.attach.branch("/cargo").branch(context.reference.nature));
  mode.freight.receive = async (path, bytes) => {
    await paladin.state.store(`${root}/${path}`, bytes);
    return mode.freight.admit(path).resolve(path);
  };
  mode.aperture.open("/freight", () => mode.freight.catalog);
};

export const FRAUGHT = (mode, context) => carry(mode, context, join(mode.module.source.dirname, mode.module.freight.path.nature));
