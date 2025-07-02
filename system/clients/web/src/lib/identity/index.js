const createAuth = (baseUrl = "/api/auth") => {
  let token = localStorage.getItem("token");
  let user = JSON.parse(localStorage.getItem("user") || "null");

  const request = async (path, options = {}) => {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  const setAuth = (newToken, newUser) => {
    token = newToken;
    user = newUser;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const clearAuth = () => {
    token = null;
    user = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return {
    login: async (username, password) => {
      const data = await request("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      setAuth(data.token, data.user);
      return data;
    },

    logout: () => {
      clearAuth();
    },

    getToken: () => token,
    getUser: () => user,
    isAuthenticated: () => !!token,

    request,
  };
};

export default createAuth;
