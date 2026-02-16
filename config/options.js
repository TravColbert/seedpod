const path = require("path");

module.exports = function (app, explicitConfig) {
  const getConfigValue = require("../lib/tools")(explicitConfig);
  const ifNotProduction = app.locals.nodeEnv !== "production";
  app.locals.nodeEnv = getConfigValue("NODE_ENV", "development", true);
  app.locals.debug = getConfigValue("DEBUG", ifNotProduction, ifNotProduction);
  app.locals.httpOn = getConfigValue("HTTP_ON", true, ifNotProduction);
  app.locals.httpsOn = getConfigValue("HTTPS_ON", true, ifNotProduction);
  app.locals.portHttp = getConfigValue("PORT_HTTP", 8080, ifNotProduction);
  app.locals.portHttps = getConfigValue("PORT_HTTPS", 8443, ifNotProduction);
  app.locals.tlsServerKey = getConfigValue(
    "TLS_SERVER_KEY",
    "server.key",
    ifNotProduction,
  );
  app.locals.tlsServerCert = getConfigValue(
    "TLS_SERVER_CERT",
    "server.cert",
    ifNotProduction,
  );
  app.locals.noCompression = getConfigValue(
    "NO_COMPRESSION",
    false,
    ifNotProduction,
  );
  app.locals.rateLimitFifteenMinuteWindow = getConfigValue(
    "RATE_LIMIT_15_MINUTE_WINDOW",
    0,
    ifNotProduction,
  );
  app.locals.cacheTtl = getConfigValue("CACHE_TTL", 60, ifNotProduction);
  app.locals.lang = getConfigValue("APP_LANG", "en", ifNotProduction);
  app.locals.appList = getConfigValue("APP_LIST", "app_base", true);
  app.locals.basePath = getConfigValue("BASE_PATH", ".", true);
  app.locals.configPath = getConfigValue(
    "CONFIG_PATH",
    "config",
    ifNotProduction,
  );
  app.locals.tlsPath = getConfigValue("TLS_PATH", "tls", ifNotProduction);
  app.locals.publicPath = getConfigValue(
    "PUBLIC_PATH",
    "public",
    ifNotProduction,
  );
  app.locals.modelPath = getConfigValue(
    "MODEL_PATH",
    "models",
    ifNotProduction,
  );
  app.locals.routerPath = getConfigValue(
    "ROUTER_PATH",
    "routes",
    ifNotProduction,
  );
  app.locals.viewPath = getConfigValue("VIEW_PATH", "views", ifNotProduction);
  app.locals.controllerPath = getConfigValue(
    "CONTROLLER_PATH",
    "controllers",
    ifNotProduction,
  );
  app.locals.helperPath = getConfigValue(
    "HELPER_PATH",
    "helpers",
    ifNotProduction,
  );
  app.locals.jobPath = getConfigValue("JOB_PATH", "jobs", ifNotProduction);
  app.locals.appName = getConfigValue(
    "APP_NAME",
    "Node.js Express Starter",
    true,
  );
  app.locals.appDescription = getConfigValue(
    "APP_DESCRIPTION",
    "A perfect way to start your Node.js Express application",
    ifNotProduction,
  );
  app.locals.appKeywords = getConfigValue(
    "APP_KEYWORDS",
    "nodejs, express, starter",
    ifNotProduction,
  );
  app.locals.sessionSecret = getConfigValue(
    "SESSION_SECRET",
    "you should really change this",
    false,
  );
  app.locals.databaseConfig = getConfigValue("DATABASE_CONFIG", false, false);
  app.locals.settingsToken = getConfigValue("SETTINGS_TOKEN", false, false);
  app.locals.contentSecurityPolicy = getConfigValue(
    "CSP",
    {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        scriptSrcElem: ["'self'", "https://unpkg.com/htmx.org@2.0.4"],
        styleSrc: ["'self'"],
        styleSrcElem: ["'self'"],
        imgSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
      },
    },
    false,
  );

  // Now, let's load options from available app modules:
  const appInstances = [...app.locals.appList.split(","), "app_base"];

  for (const appInstance of appInstances) {
    const optionsPath = path.join(
      __dirname,
      "..",
      app.locals.basePath,
      appInstance.trim(),
      app.locals.configPath,
      "options.js",
    );
    try {
      require(optionsPath)(app, explicitConfig);
    } catch (err) {
      if (err.code === "MODULE_NOT_FOUND") {
        app.locals.debug &&
          console.debug(
            `⚠️  No options file found for ${appInstance.trim()} at ${optionsPath}, skipping...`,
          );
      } else {
        console.error(
          `❌  Error loading options for ${appInstance.trim()} from ${optionsPath}:`,
          err,
        );
      }
    }
  }
};
