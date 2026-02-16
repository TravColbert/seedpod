const fs = require("fs");
const path = require("path");

/**
 * This module defines jobs that can be run in the application.
 *
 * Each add-on modules (app, app_base, app_tv, etc.) can define their own jobs.js file
 *
 * @param {*} app
 */
module.exports = function (app) {
  /**
   * Manual job runner
   *
   * Invoked with a trigger string, runs all jobs registered for that trigger
   *
   * @param {*} trigger
   * @returns
   */
  app.locals.runJobs = async function (trigger) {
    console.log(`Running jobs for trigger: ${trigger}`);

    if (!app.locals.jobs) {
      console.log("No jobs defined.");
      return;
    }

    for (const [jobName, job] of Object.entries(app.locals.jobs)) {
      if (job.trigger === trigger) {
        console.log(`Running job: ${jobName}...`);
        try {
          await job.run();
          console.log(`Job ${jobName} completed successfully.`);
        } catch (err) {
          console.error(`Error running job ${jobName}:`, err);
          throw err;
        }
      }
    }

    console.log(`Completed running jobs for trigger: ${trigger}`);
    return true;
  };

  for (const appInstance of app.locals.appList.split(",")) {
    const jobPath = path.join(
      __dirname,
      "..",
      app.locals.basePath,
      appInstance.trim(),
      app.locals.jobPath,
    );

    app.locals.debug &&
      console.debug(`Attempting load of job path: ${jobPath}...`);

    if (fs.existsSync(jobPath)) {
      // Get all .js files from job path
      const jobFiles = fs
        .readdirSync(jobPath)
        .filter((file) => file.endsWith(".js"));

      jobFiles.forEach((file) => {
        const jobName = path.parse(file).name;
        try {
          // Load each job file passing the app instance to it
          require(path.join(jobPath, file))(app);
        } catch (e) {
          console.error(`Error loading job ${jobName} from ${file}:`, e);
        }
      });
    }
  }
};
