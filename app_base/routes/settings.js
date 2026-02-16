const express = require("express")

module.exports = function (app) {
    const router = express.Router({ mergeParams: true })

    // Turn off this route in production
    if (app.locals.nodeEnv === "production") return router

    const safeKeys = [
        "nodeEnv", "debug", "httpOn", "httpsOn", "portHttp",
        "portHttps", "noCompression", "rateLimitFifteenMinuteWindow", "cacheTtl",
        "lang", "appList", "appName", "appDescription", "appKeywords",
        "contentSecurityPolicy"
    ];

    const isAuthorized = (req) => {
        const token = req.get('X-Settings-Token');
        // if SETTINGS_TOKEN is not set, this feature is disabled
        if (!app.locals.settingsToken) return false;
        return token === app.locals.settingsToken;
    }

    const filterSettings = (settings) => {
        const filtered = {};
        for (const key of safeKeys) {
            if (Object.hasOwn(settings, key)) {
                filtered[key] = settings[key];
            }
        }
        return filtered;
    }

    router.route("/routes")
        .get((req, res) => {
            app.locals.debug && console.debug("Got request for routes")
            if (!isAuthorized(req)) {
                return res.status(403).json({ error: "Access denied" });
            }
            res.json(app._router.stack)
        })

    router.route("/:key")
        .get((req, res) => {
            app.locals.debug && console.debug(`Got request for settings key: ${req.params.key}`)
            const key = req.params.key;

            // always deny showing the settings token
            if (key === 'settingsToken') {
                return res.status(403).json({ error: "Access denied" });
            }

            if (safeKeys.includes(key) && Object.hasOwn(app.locals, key)) {
                return res.json(app.locals[key])
            }

            if (isAuthorized(req)) {
                if (Object.hasOwn(app.locals, key)) {
                    return res.json(app.locals[key])
                }
            }

            res.status(404).json({ error: "No configuration for that key or access denied" })
        })

    router.route("/")
        .get((req, res) => {
            app.locals.debug && console.debug("In settings route...")
            if (isAuthorized(req)) {
                const { settingsToken, ...rest } = app.locals;
                res.json(rest)
            } else {
                res.json(filterSettings(app.locals));
            }
        })

    return router
}