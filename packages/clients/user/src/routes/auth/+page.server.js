import { fail, redirect } from "@sveltejs/kit";
import { AuthApiError } from "@supabase/supabase-js";

export const load = async ({ locals }) => {
  const session = await locals.getSession();

  /* User is already logged in. */
  if (session) throw redirect(303, "/");
};

const post_auth_path = "";

function setAuthCookie(session, cookie, request) {
  const cookieValue = JSON.stringify(session);
  const secure = process.env.NODE_ENV === "production";

  const rootDomainCookie = cookie.serialize(
    "sb-vivalence-auth-token",
    encodeURIComponent(cookieValue),
    {
      domain: "vivalence.com",
      path: "/",
      sameSite: "None",
      secure: secure,
      httpOnly: true,
    }
  );

  const localDomainCookie = cookie.serialize(
    "sb-vivalence-auth-token",
    encodeURIComponent(cookieValue),
    {
      domain: "localhost",
      path: "/",
      sameSite: "None",
      httpOnly: true,
    }
  );
  const subDomainCookie = cookie.serialize(
    "sb-vivalence-auth-token",
    encodeURIComponent(cookieValue),
    {
      domain: ".vivalence.com",
      path: "/",
      sameSite: "None",
      secure: secure,
      httpOnly: true,
    }
  );

  request.headers.set("Set-Cookie", rootDomainCookie);
  request.headers.append("Set-Cookie", localDomainCookie);
  request.headers.append("Set-Cookie", subDomainCookie);
}

export const actions = {
  signup: async ({ request, url, locals, cookies }) => {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");

    if (email && password) {
      const { error, data: session } = await locals.supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${url.origin}/${post_auth_path}` },
      });

      if (error) {
        console.error(error);
        return;
      }

      // setAuthCookie(session, cookies, request);

      return { message: "Please check your email to confirm your signup." };
    }
  },
  signin: async ({ request, url, locals, cookies }) => {
    console.log("+page.server SIGNING request", request);
    const formData = await request.formData();
    console.log("+page.server SIGNING formData", formData);
    const email = formData.get("email");
    const password = formData.get("password");
    const provider = formData.get("provider");

    if (email && password) {
      const cred = { email, password };
      // console.log("cred", cred);
      const { error, data } = await locals.supabase.auth.signInWithPassword(cred);
      const session = data.session;

      if (error) {
        console.error("signup error", error);
        if (error instanceof AuthApiError && error.status === 400) {
          return fail(400, { error: "Invalid credentials.", data: { email } });
        }
        return fail(500, { error: "Server error. Try again later.", data: { email } });
      }

      // setAuthCookie(session, cookies, request);

      throw redirect(303, `/${post_auth_path}`);
    } else {
      return fail(400, {
        error: "Please enter an email and password",
        data: {
          email,
        },
      });
    }
  },
  signout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    throw redirect(303, "/");
  },
};
