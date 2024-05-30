let post = () => {
    console.log("global post NOT INITIALIZED");
    return { error: 500 };
};

let supabase = () => {
    console.log("global supabase NOT INITIALIZED");
    return { error: 500 };
};

export default { post, supabase };
