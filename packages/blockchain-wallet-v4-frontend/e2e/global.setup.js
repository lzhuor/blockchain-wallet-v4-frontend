const fs = require('fs')
const { exec, execSync } = require('child_process')

// sometimes the previous server doesnt exit correctly, ensure port is open for tests
exec('kill $(lsof -t -i:8080)')

// check if application has already been compiled for production
if (fs.existsSync('./../../dist')) {
  console.log('Application dist folder found! Continuing...')
  process.exit(0)
} else {
  console.log('Application dist folder was not found! Compiling app now...')

  return execSync('npm run ci:compile', { cwd: './..', stdio: 'inherit' })
}
