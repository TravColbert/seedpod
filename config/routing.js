const fs = require("fs");
const path = require("path");
const routing = require("../lib/routing");

module.exports = function (app) {
  const middleware = require("../lib/middleware")(app);

  app.locals.debug && console.debug("ℹ️  Setting up routes");

  app.use([
    middleware.appHello,
    middleware.preFlightRouteCheck,
    middleware.setRenderObject,
    middleware.setAppLanguage,
    middleware.setAppName,
    middleware.detectHtmxRequest,
  ]);

  const appInstances = [
    ...new Set([...app.locals.appList.split(","), "app_base"]),
  ];

  /**
   * Dynamically load all routers from each app instance
   * Also include the 'app_base' instance for default/shared routes
   */
  for (const appInstance of appInstances) {
    // Since we're currently in config/, we need to go up one level to __dirname
    const routerPath = path.join(
      __dirname,
      "..",
      app.locals.basePath,
      appInstance.trim(),
      app.locals.routerPath,
    );

    app.locals.debug &&
      console.debug(`ℹ️  Checking router path: ${routerPath}...`);

    if (fs.existsSync(routerPath)) {
      // Get all .js files from router path
      const routerFiles = fs
        .readdirSync(routerPath)
        .filter((file) => file.endsWith(".js"))
        .filter((file) => file !== "index.js"); // Exclude index.js

      app.use((req, res, next) => {
        // Set the current path in the request object
        req.currentPath = req.path;
        next();
      });

      // Load and mount each router
      routerFiles.forEach((file) => {
        const routeName = path.parse(file).name;
        app.locals.debug && console.debug(`ℹ️  Mounting router: ${routeName}`);
        try {
          const router = require(path.join(routerPath, file))(
            app,
            appInstance.trim(),
          );
          // The name of the route is the same as the file name
          app.use(`/${routeName}`, router);
        } catch (e) {
          console.error(`Error loading router ${routeName} from ${file}:`, e);
        }
      });
    } else {
      app.locals.debug &&
        console.debug(`⚠️  No router found at path: ${routerPath}`);
    }
  }

  /**
   * Mount the "index" router at '/'.
   *
   * All the routers above are mounted to a route that matches the name of the
   * route file. e.g.: settings.js will mount and respond to the /settings path.
   *
   * But, we need to make a small exception to this rule for the '/' path. We
   * purposely skipped mounting any 'index.js' routes, above, for this reason.
   * So, in this case, index.js is mounted to the '/' path.
   *
   * This is the default router that handles the root path
   * The default router will be the first app instance with a router folder
   * and an index.js file
   */
  for (const appInstance of appInstances) {
    const routerPath = path.join(
      __dirname,
      "..",
      app.locals.basePath,
      appInstance.trim(),
      app.locals.routerPath,
      "index.js",
    );
    if (fs.existsSync(routerPath)) {
      app.locals.debug &&
        console.debug(
          `ℹ️  Mounting index(/) route from ${appInstance.trim()} `,
        );
      try {
        const indexRouter = require(routerPath)(app, appInstance.trim());
        app.use("/", indexRouter);
        break;
      } catch (e) {
        console.error(`Error loading index router from ${routerPath}:`, e);
      }
    }
  }

  /**
   * If we still haven't established a default route (/)
   * then start looking for a PUG template that can serve
   * as the index file.
   */
  if (!routing.findRoute(app._router.stack, "/")) {
    app.locals.debug &&
      console.info(`⚠️  No "/" route found, seeking default home view...`);
    // Check each app instance for a home view
    for (const appInstance of appInstances) {
      const viewPath = path.join(
        __dirname,
        "..",
        app.locals.basePath,
        appInstance.trim(),
        app.locals.viewPath,
        "index.pug",
      );
      app.locals.debug && console.debug(`Searching for: ${viewPath}`);
      if (fs.existsSync(viewPath)) {
        // Is there a home view here?
        app.locals.debug &&
          console.debug(`ℹ️  Mounting ${viewPath} as home view`);
        app.get("/", middleware.setFoundRoute);
        break;
      }
      // else {
      //   // Otherwise use a default "Hello World!" response
      //   app.get("/", (_req, res) => {
      //     console.warn(
      //       `⚠️  No home view found for ${appInstance.trim()}, using default response.`,
      //     );
      //     res.send("Hello World!");
      //   });
      // }
    }
  }

  app.use(middleware.defaultRender);

  /**
   * Default error handling
   */
  app.use(middleware.errorHandler);

  /**
   * 404 not found route
   */
  app.use(middleware.notFoundHandler);
};
