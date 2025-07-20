// manifest
//   type dataset
//   traits reactive

// react(on){
//     on.branch(data/user)
//       .open(before/update, ()=>())
//       .open(after/create, (ctx)=>{
//         # ctx.event.user
// 	# ctx.runtime.entities.intent.createMany([])
//       })
// }

// import { UserEntity } from "@vivalence/entities"; // applied to `global.db`

// export class UserSubscriber {
//   // constructor(em) {em.getEventManager().registerSubscriber(this);}

//   getSubscribedEntities() {
//     return [UserEntity];
//   }

//   async afterUpdate(args) {
//     console.log("after Update args this", { args, this: this });
//   }
//   async afterCreate(args) {
//     console.log("after create args this", { args, this: this });
//   }

//   // async beforeCreate(args) {}
//   // async beforeUpdate(args) {}
//   // async afterUpdate(args) {}
//   // async beforeUpsert(args) {}
//   // async afterUpsert(args) {}
//   // async beforeDelete(args) {}
//   // async afterDelete(args) {}
// }

// // console.log("UserSchema.hooks", UserSchema._meta.hooks);
// // TagSchema._meta.hooks["beforeCreate"] = [
// //   (args) => console.log("beforeCreate", args, Object.keys(args)), //args.entity
// // ];
// // console.log("Schema.hooks", TagSchema._meta.hooks);
