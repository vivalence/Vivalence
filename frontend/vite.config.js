import { sveltekit } from "@sveltejs/kit/vite";
import houdini from "houdini/vite";
import { defineConfig } from "vite";

// function ignoreEmacsTempFiles() {
//     return {
//         name: "ignore-emacs-temp-files",
//         configureServer(server) {
//             // Override the file watcher to ignore paths with .# prefix
//             const originalWatcherHandler = server.watcher.handleEvent.bind(server.watcher);

//             server.watcher.handleEvent = async (event, path) => {
//                 if (path.includes("/.#")) {
//                     // Ignore the event
//                     return;
//                 }
//                 // Call the original file watcher event handler
//                 await originalWatcherHandler(event, path);
//             };
//         }
//     };
// }ignoreEmacsTempFiles(),

export default defineConfig({
    server: {
        watch: {
            ignored: ["**/.#*"] // Ignore files starting with .# in any directory
        }
    },

    plugins: [houdini(), sveltekit()]
});
