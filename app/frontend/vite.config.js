import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import houdini from "houdini/vite";

export default defineConfig({
    plugins: [houdini(), sveltekit()],
    logLevel: "info",
    mode: "development"
});

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
