const express = require("express");
const path = require("path");
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
  const routeRoot = path.join(__dirname, "..", "views");
  router.route("/").get(middleware.serveEverythingFrom(routeRoot));

  return router;
};
