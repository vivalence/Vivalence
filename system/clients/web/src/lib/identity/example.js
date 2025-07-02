import createAuth from "./identity/index.js";

const auth = createAuth("https://api.example.com/auth");

document.getElementById("login-form").onsubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  try {
    await auth.login(formData.get("username"), formData.get("password"));
    console.log("Logged in as:", auth.getUser().username);
  } catch (error) {
    console.error("Login failed:", error.message);
  }
};

document.getElementById("logout-btn").onclick = () => {
  auth.logout();
  console.log("Logged out");
};

if (auth.isAuthenticated()) {
  console.log("Welcome back:", auth.getUser().username);
}

const fetchUserData = async () => {
  try {
    const data = await auth.request("/user/profile");
    console.log("Profile:", data);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }
};

const createPost = async (title, content) => {
  return auth.request("/posts", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
};
