const chalk = require('chalk')
const fs = require('fs')
const { exec, execSync } = require('child_process')

/* eslint-disable */
// sometimes the previous server doesnt exit correctly, ensure port is open for tests
console.log(chalk.red('Killing with \u{1F525}any process running on port 8080...'))
exec('kill $(lsof -t -i:8080)')

// check if application has already been compiled for production
if (fs.existsSync('./../../dist')) {
  console.log(chalk.blue('\u{1F680} /dist folder found in root! Prepare for launch... \u{1F680}'))
  console.log(chalk.red('\u{1F6A8} Reminder: ') + chalk.yellow('If you have changed app source code, you need to rebuild /dist to see changes! \u{1F6A8}'))
  process.exit(0)
} else {
  console.log(chalk.blue('\u{23F3}App /dist folder was not found! Compiling /dist now... \u{231B}'))

  return execSync('npm run ci:compile', { cwd: './..', stdio: 'inherit' })
}
/* eslint-enable */
