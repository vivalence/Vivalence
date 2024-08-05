// export const load = async ({ locals, ...params }) => {
//   const { data: strategies, error } = await locals.supabase
//     .from("Strategy")
//     .select(`*, _StrategyToTag (A, B, Tag (id, name, type))`)
//     .eq("objectStatus", "ACTIVE");

//   if (error) console.error(error);

//   return { strategies };
// };
