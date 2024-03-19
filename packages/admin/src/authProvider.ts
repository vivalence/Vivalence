import { AuthBindings } from "@refinedev/core";

import { supabaseClient } from "./utility";
const { VITE_VIVALENCE_AUTH_PATH, VITE_SYSTEM_MODE } = import.meta.env;

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
                if (VITE_SYSTEM_MODE && +VITE_SYSTEM_MODE > 2)
                    window.location.href = VITE_VIVALENCE_AUTH_PATH;
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
                if (VITE_SYSTEM_MODE && +VITE_SYSTEM_MODE > 2)
                    window.location.href = VITE_VIVALENCE_AUTH_PATH;
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
            if (VITE_SYSTEM_MODE && +VITE_SYSTEM_MODE > 2)
                window.location.href = VITE_VIVALENCE_AUTH_PATH;
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
