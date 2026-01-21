const express = require("express");
const router = express.Router({ mergeParams: true });

module.exports = function (app) {
  // Turn off this route in production
  if (app.locals.nodeEnv === "production") return router;

  const middleware = require("../../lib/middleware")(app, __dirname);

  router.route("/test").get((_req, res, next) => {
    res.locals.render.template = "test";
    next();
  });

  // The default template is: "index"
  router.route("/").get(middleware.serveEverything);

  return router;
};
