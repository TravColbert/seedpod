const tape = require("tape");
const supertest = require("supertest");
const appFactory = require("../app");
const testAConfig = {
  IMPORT_ENV: false, // Do not import from .env file through the dotenv package
  NODE_ENV: "test",
  BASE_PATH: "test",
  APP_LIST: "app_test_a",
};

const testBConfig = { ...testAConfig, APP_LIST: "app_test_b" };

tape("GET / on unconfigured app responds with 404", (t) => {
  appFactory(testAConfig)
    .then((app) => {
      supertest(app)
        .get("/")
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

tape("GET non-existent route responds with 404", (t) => {
  appFactory(testAConfig)
    .then((app) => {
      supertest(app)
        .get("/test")
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

tape("GET / on app with index.pug template responds with 200", (t) => {
  appFactory(testBConfig)
    .then((app) => {
      supertest(app)
        .get("/")
        .expect(200, "Hello !")
        .end((err, res) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("GET / with query params responds with 200", (t) => {
  appFactory(testBConfig)
    .then((app) => {
      supertest(app)
        .get("/")
        .query({ thing: "World" })
        .expect(200, "Hello World!")
        .end((err) => {
          if (err) {
            t.error(err, "Got error: " + err);
          }
          t.end();
        });
    })
    .catch((err) => t.fail(err));
});

tape("Finds any fitting template (test.pug)", (t) => {
  appFactory(testBConfig)
    .then((app) => {
      supertest(app)
        .get("/test")
        .query({ thing: "World" })
        .expect(200, "PUG World!")
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
  appFactory(testBConfig)
    .then((app) => {
      supertest(app)
        .get("/deeper/path")
        .query({ thing: "World" })
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
  appFactory(testBConfig)
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
  appFactory(testBConfig)
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
  appFactory(testBConfig)
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
  appFactory(testBConfig)
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
