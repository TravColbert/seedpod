const tape = require("tape");
const supertest = require("supertest");
const appFactory = require("../app");
const testConfig = {
  IMPORT_ENV: false, // Do not import from .env file through the dotenv package
  NODE_ENV: "test",
  BASE_PATH: "test",
  APP_LIST: "app_test",
};

tape("GET / responds with 200 and Hello World!", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/")
        .expect(200, "Hello World!") // Responds with the ultra-fallback success response
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET /bogus responds with 404", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/bogus")
        .expect(404)
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("Set BASE_PATH reaches test app", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/test")
        .expect(200, "TESTING World!")
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("A templates at any depth", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/deeper/path")
        .expect(200, "DEEPER World")
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("Skips dot (.) paths at any depth", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/.fragments/layout")
        .expect(404)
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("Dot (.) paths work for includes", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/pug")
        .expect(
          200,
          '<!DOCTYPE html><html lang="en"><body>Hello World!<p>But we can get to this text directly.</p></body></html>',
        )
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("Responds with HTML file", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/page")
        .expect(
          200,
          '<!DOCTYPE html>\n<html lang="en">\n  <body>\n    Hello World!\n  </body>\n</html>\n',
        )
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("Responds with JS-generated result", (t) => {
  appFactory(testConfig)
    .then((app) => {
      supertest(app)
        .get("/script")
        .expect(
          200,
          '<!DOCTYPE html>\n<html lang="en">\n  <body>\n    Hello World!\n  </body>\n</html>\n',
        )
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});
