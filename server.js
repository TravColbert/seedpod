"use strict";
const http = require("http");
const https = require("https");

const appFactory = require("./app");

let config = null;

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

// Get optional JSON string from command line argument
if (process.argv[2]) {
    try {
        config = JSON.parse(process.argv[2]);
    } catch (err) {
        console.error(
            "Ignoring invalid JSON string passed as argument:",
            err.message,
        );
    }
}

appFactory(config).then((app) => {
    if (app.locals.db) {
        app.locals.db
            .sync()
            .then(() => {
                console.log("Database synchronized successfully.");
                app.locals.runJobs("onAppStart");
            })
            .catch((err) => {
                console.error("Error synchronizing database:", err);
                process.exit(1); // Exit if database sync fails
            });
    }

    if (app.locals.httpOn) {
        http.createServer(app).listen(app.locals.portHttp, () =>
            console.log(`Listening on port: ${app.locals.portHttp}`),
        );
    }

    if (app.locals.httpsOn && app.locals.tlsCredentials) {
        https
            .createServer(app.locals.tlsCredentials, app)
            .listen(app.locals.portHttps, () =>
                console.log(`Listening on port: ${app.locals.portHttps}`),
            );
    }
});
