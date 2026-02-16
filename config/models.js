const fs = require('fs')
const path = require('path')

module.exports = function (app) {
    app.locals.models = []

    for (const appInstance of app.locals.appList.split(',')) {
        const modelPath = path.join(__dirname, "..", app.locals.basePath, appInstance.trim(), app.locals.modelPath)

        app.locals.debug && console.debug(`Attempting load of model path: ${modelPath}...`)

        if (fs.existsSync(modelPath)) {
            // Get all .js files from model path
            const modelFiles = fs.readdirSync(modelPath)
                .filter(file => file.endsWith('.js'))

            modelFiles.forEach(file => {
                const modelName = path.parse(file).name
                app.locals.debug && console.debug(`Hydrating model: ${modelName}`)
                try {
                    const model = require(path.join(modelPath, file))
                    // If the model is a function, call it with app
                    if (typeof model === 'function') {
                        app.locals.models[modelName] = model(app)
                    } else {
                        app.locals.models[modelName] = model
                    }
                } catch (e) {
                    console.error(`Error loading model ${modelName} from ${file}:`, e)
                }
            })
        }
    }
}
