const express = require("express")
const router = express.Router({ mergeParams: true })

module.exports = function (app, appInstance) {
  router.route("/test")
    .get((_req, res) => {
      console.debug(`In TEST INDEX route of app: ${appInstance}`)
      res.send("In test app")
    })

  return router
}