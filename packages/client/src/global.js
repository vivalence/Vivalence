let post = () => {
    console.log("global post NOT INITIALIZED");
    return {};
};

let supabase = () => {
    console.log("global supabase NOT INITIALIZED");
    return {};
};

export default { post, supabase };
