import { AuthBindings } from "@refinedev/core";
import supabase from "$util/supabaseClient";

const { VITE_VIVALENCE_AUTH_PATH, VITE_SYSTEM_MODE } = import.meta.env;

const authProvider: AuthBindings = {
  login: async ({ email, password, providerName }) => {
    // console.log("authProvider login", email, password, providerName);

    const { user, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (!error) {
      return {
        success: true,
        user,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        message: "Login failed",
        name: "Invalid email or password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();

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
    const currentPath = window.location.pathname;
    try {
      const { data } = await supabase.auth.getSession();
      const { session } = data;
      // console.log("authprovider check session", session);
      if (!session && currentPath.startsWith("/login")) {
        return {
          authenticated: true,
        };
      }
      if (!session) {
        // if (VITE_SYSTEM_MODE && +VITE_SYSTEM_MODE > 2)
        //     window.location.href = VITE_VIVALENCE_AUTH_PATH;
        return {
          authenticated: false,
          error: {
            message: "Check failed",
            name: "Session not found",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
      if (!session.user.user_metadata.roles.includes("ADMIN")) {
        // if (VITE_SYSTEM_MODE && +VITE_SYSTEM_MODE > 2)
        //     window.location.href = VITE_VIVALENCE_AUTH_PATH;
        return {
          authenticated: false,
          error: {
            message: "Permission Error",
            name: "Not Admin",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
    } catch (error: any) {
      // if (VITE_SYSTEM_MODE && +VITE_SYSTEM_MODE > 2)
      //     window.location.href = VITE_VIVALENCE_AUTH_PATH;
      return {
        authenticated: false,
        error: error || {
          message: "Check failed",
          name: "Not authenticated",
        },
        logout: true,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: true,
    };
  },
};

export default authProvider;
