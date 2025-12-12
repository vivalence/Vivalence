import { Connection, Path } from "@vivalence/typology";

export class Daemon {
  entities = {};
  // manifest, path
  // schema
  constructor(connection) {
    this.connection = connection;

    // this.call = new Call(this.connection) //
    //   .use(async (ctx, next) => {
    //     await next();
    //     // console.log(ctx);
    //   });
    // .use(backstop(this))
    // .use(authorize(this.$authority));
  }
}
