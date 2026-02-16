const tape = require("tape");
const supertest = require("supertest");
const appFactory = require("../app");

const testConfig = {
  IMPORT_ENV: false,
  NODE_ENV: "test",
  SETTINGS_TOKEN: "test-secret-token",
};

const safeKeys = [
  "nodeEnv", "debug", "httpOn", "httpsOn", "portHttp",
  "portHttps", "noCompression", "rateLimitFifteenMinuteWindow", "cacheTtl",
  "lang", "appList", "appName", "appDescription", "appKeywords",
  "contentSecurityPolicy"
];

const sensitiveKeys = [
  "sessionSecret", "databaseConfig", "tlsServerKey", "tlsServerCert"
];

// --- Unauthenticated access: GET /settings/ ---

tape("GET /settings/ without token returns only safe keys", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/")
        .expect(200)
        .end((err, res) => {
          if (err) return t.end(err);
          const keys = Object.keys(res.body);
          for (const key of safeKeys) {
            t.ok(keys.includes(key), `response includes safe key: ${key}`);
          }
          for (const key of sensitiveKeys) {
            t.notOk(keys.includes(key), `response does not include sensitive key: ${key}`);
          }
          t.notOk(keys.includes("settingsToken"), "response does not include settingsToken");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

// --- Unauthenticated access: GET /settings/:key ---

tape("GET /settings/:safeKey without token returns the value", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/appName")
        .expect(200)
        .end((err, res) => {
          if (err) return t.end(err);
          t.equal(res.body, app.locals.appName, "returns the correct appName value");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET /settings/:sensitiveKey without token returns 404", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/sessionSecret")
        .expect(404)
        .end((err, res) => {
          if (err) return t.end(err);
          t.ok(res.body.error, "response contains an error message");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET /settings/settingsToken without token returns 403", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/settingsToken")
        .expect(403)
        .end((err, res) => {
          if (err) return t.end(err);
          t.equal(res.body.error, "Access denied", "returns access denied");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

// --- Authenticated access: GET /settings/ ---

tape("GET /settings/ with valid token returns all keys except settingsToken", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/")
        .set("X-Settings-Token", "test-secret-token")
        .expect(200)
        .end((err, res) => {
          if (err) return t.end(err);
          const keys = Object.keys(res.body);
          for (const key of safeKeys) {
            t.ok(keys.includes(key), `authorized response includes safe key: ${key}`);
          }
          for (const key of sensitiveKeys) {
            t.ok(keys.includes(key), `authorized response includes restricted key: ${key}`);
          }
          t.notOk(keys.includes("settingsToken"), "settingsToken is excluded even when authorized");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET /settings/ with invalid token returns only safe keys", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/")
        .set("X-Settings-Token", "wrong-token")
        .expect(200)
        .end((err, res) => {
          if (err) return t.end(err);
          const keys = Object.keys(res.body);
          for (const key of sensitiveKeys) {
            t.notOk(keys.includes(key), `invalid token does not expose: ${key}`);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

// --- Authenticated access: GET /settings/:key ---

tape("GET /settings/:sensitiveKey with valid token returns the value", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/sessionSecret")
        .set("X-Settings-Token", "test-secret-token")
        .expect(200)
        .end((err, res) => {
          if (err) return t.end(err);
          t.equal(res.body, app.locals.sessionSecret, "returns the correct sessionSecret value");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET /settings/settingsToken with valid token still returns 403", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/settingsToken")
        .set("X-Settings-Token", "test-secret-token")
        .expect(403)
        .end((err, res) => {
          if (err) return t.end(err);
          t.equal(res.body.error, "Access denied", "settingsToken is never exposed via /:key");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

// --- /settings/routes endpoint ---

tape("GET /settings/routes without token returns 403", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/routes")
        .expect(403)
        .end((err, res) => {
          if (err) return t.end(err);
          t.equal(res.body.error, "Access denied", "routes endpoint requires authorization");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET /settings/routes with valid token returns router stack", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/settings/routes")
        .set("X-Settings-Token", "test-secret-token")
        .expect(200)
        .end((err, res) => {
          if (err) return t.end(err);
          t.ok(Array.isArray(res.body), "returns an array of routes");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

// NOTE: Production mode route disabling (nodeEnv === "production" guard) cannot
// be reliably tested in the same process as other tests due to the `config` npm
// module caching NODE_ENV from the first app instantiation. The guard was verified
// manually and works correctly in isolation.

// --- No SETTINGS_TOKEN configured: authorized features disabled ---

tape("GET /settings/:sensitiveKey is denied when SETTINGS_TOKEN is not configured", (t) => {
  appFactory({ IMPORT_ENV: false, NODE_ENV: "test" })
    .then((app) => {
      supertest(app)
        .get("/settings/sessionSecret")
        .set("X-Settings-Token", "any-token")
        .expect(404)
        .end((err, res) => {
          if (err) return t.end(err);
          t.ok(res.body.error, "authorization is disabled when no token is configured");
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});
