import { encodeBase64 } from "@std/encoding/base64";
import { Connection, Url } from "@vivalence/typology";

export const remote = (service) => {
  const connection = new Connection(new Url(service.statics.remote));
  const options = { method: "POST", headers: { Authorization: `Bearer ${service.secrets.key}` } };

  return (language) => ({
    async read(ink, stated) {
      const answered = await connection.fetch("/read", { ...stated, language, data: encodeBase64(ink) }, options);
      if (answered.status === 0) throw new Error(`ocr: ${service.statics.remote} does not answer`);
      if (answered.error) throw new Error(`ocr: ${answered.body.message}`);
      return answered.body.tsv;
    },
    close: () => undefined,
  });
};
