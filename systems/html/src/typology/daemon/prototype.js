import { Call } from "$hut/typology";

export class Daemon {
  entities = {}; //
  constructor(connection) {
    this.connection = connection;

    this.call = new Call(this.connection) //
      .use(async (ctx, next) => {
        await next();
        // console.log(ctx);
      });
    // .use(backstop(this))
    // .use(authorize(this.$authority));
  }
}
