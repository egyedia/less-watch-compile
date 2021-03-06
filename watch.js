'use strict'
module.exports.start = (safety, input, isFile) => {
  const fs = require('fs')
  const path = require('path')
  const less = require('less')
  const chalk = require('chalk');

  const home = process.cwd()

  const stylesDir = path.join(home, input)

  console.log('Watching ' + input)

  let isCompiling = false

  if (!isFile) {
    fs.watch(stylesDir, {
        recursive: true
      },
      (event, file) => {
        if (path.extname(file) != '.less') return
        if (!safety && path.basename(file).startsWith('_')) return

        renderCss(path.join(stylesDir, file))
      })
  }
  else {

    fs.watchFile(stylesDir, (curr, prev) => {
      if (curr.size == 0) {
        console.log(stylesDir + ' does not exist. Try making it first.')
        return
      }
      renderCss(stylesDir)
    })
  }

  function renderCss(file) {
    if (isCompiling) return

    console.log((chalk.yellow('Detected change in \'' + file + '\'')))

    let start = Date.now()
    isCompiling = true

    setTimeout(() => {
      isCompiling = false
    }, 100);

    console.log(chalk.yellow('Attemping to compile ' + file))
    const content = fs.readFileSync(file, 'utf-8')
    less.render(content).then(
      output => {
        const cssFilename = path.basename(file, '.less') + '.css'
        fs.writeFileSync(path.join(path.dirname(file), cssFilename), output.css)
        console.log(chalk.green('Succesfully compiled in ') + chalk.yellow((Date.now() - start) + 'ms'))
      },
      error => {
        console.log('Unsuccesful. Failed to render.\n' + error)
      })
  }
}