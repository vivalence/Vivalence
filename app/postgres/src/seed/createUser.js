import supabase from "../clients/supabase.js";

// console.log("process.env.ADMINUSER_PASSWORD,", process.env.ADMINUSER_PASSWORD);

export async function main() {
  const request = await supabase.auth.signUp({
    email: "finn@vivalence.com",
    password: process.env.USER_PASSWORD,
  });
  console.log("request", request);

  // const test = await supabase.from("test").select("*");
  // // const test = await supabase.from('countries').select('*');
  // // console.log('test', test);

  // // console.log('fetchSupabaseData ', await fetchSupabaseData());

  // const user = await supabase.auth.getUser();
  // console.log("user", user);

  // const session = await supabase.auth.getSession();
  // console.log("session", session);

  // return {
  //   countries: [],
  // };
}

await main();
