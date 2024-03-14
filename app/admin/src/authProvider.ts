import { AuthBindings } from "@refinedev/core";

import { supabaseClient } from "./utility";

const authProvider: AuthBindings = {
    login: async ({ email, password, providerName }) => {
        return {
            success: false,
            error: {
                message: "Login failed",
                name: "Invalid email or password",
            },
        };
    },
    logout: async () => {
        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            return {
                success: false,
                error,
            };
        }
        return {
            success: true,
            redirectTo: "/",
        };
    },
    onError: async (error) => {
        console.error(error);
        return { error };
    },
    check: async () => {
        try {
            const { data } = await supabaseClient.auth.getSession();
            const { session } = data;
            console.log("authprovider check session", session);

            if (!session) {
                // window.location.href = "https://auth.vivalence.com";
                return {
                    authenticated: false,
                    error: {
                        message: "Check failed",
                        name: "Session not found",
                    },
                    logout: true,
                    redirectTo: "/",
                };
            }
            if (!session.user.user_metadata.roles.includes("ADMIN")) {
                // window.location.href = "https://auth.vivalence.com";
                return {
                    authenticated: false,
                    error: {
                        message: "Permission Error",
                        name: "Not Admin",
                    },
                    logout: true,
                    redirectTo: "/",
                };
            }
        } catch (error: any) {
            // window.location.href = "https://auth.vivalence.com";
            return {
                authenticated: false,
                error: error || {
                    message: "Check failed",
                    name: "Not authenticated",
                },
                logout: true,
                redirectTo: "/",
            };
        }

        return {
            authenticated: true,
        };
    },
};

export default authProvider;
