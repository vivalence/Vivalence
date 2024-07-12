export default function serve({ app, runtimes, router }) {
    app.use(router.routes());
    app.use(router.allowedMethods());

    for (const runtime of runtimes.values()) {
        app.use(runtime.router.routes());
        app.use(runtime.router.allowedMethods());
    }

    const server = app.listen({ port: 8000 });
    console.log("Server running on http://localhost:8000");
    return { app, server, runtimes };
}
