#!/usr/bin/env node

const chalk = require('chalk'),
      clear = require('clear'),
      figlet = require('figlet'),
      repo = require('./lib/repo');
const files = require('./lib/files');
//const inquirer = require('./lib/inquirer');
const github = require('./lib/github');



clear();
console.log(
    chalk.yellow(
        figlet.textSync('Gilit', {horizontalLayout: 'full'})
    )
);

if (files.directoryExists('.git')) {
    console.log(chalk.red('Already a git repository!'));
    process.exit();
}

const getGithubToken = async () => {
     // Fetch token from config store
  let token = github.getStoredGithubToken();
  if (token) {
      return token
  }

  // No token found, use credentials to access Github account
  await github.setGithubCredentials();

  // Check if access token for gilit was registered
  const accessToken = await github.hasAccessToken();
  if(accessToken) {
      console.log(chalk.yellow('An existing access token has been found!'));
      // Ask user to regenerate a new token
      token = await github.registerNewToken(accessToken.id);
      return token;
  }

  //No access token found, register one now
  token = await github.registerNewToken();
  return token;
}

const run = async () => {

try {
    // const credentials = await inquirer.askGighubCredentials();
    // console.log(credentials);
  
    // Retrieve and  Set Authentication Token
    const token = await getGithubToken();
    github.githubAuth(token);
  
    // Create remote repository
    const url = await repo.createRemoteRepo();
  
    // Create .gitignore file
    await repo.createGitignore();
  
    // Setup local repository and push to remote
    const done = await repo.setupRepo(url);
    if (done) {
        console.log(chalk.green('All done!'));
    }
} catch (error) {
    if (error) {
        switch (error.code) {
            case 401: 
            console.log(chalk.red('Cound\'t log you in. Please provide correct credentials/token.'));
            break;
            case 422: 
            console.log(chalk.red('There already exists a remote repository with the same name'));
            break;
            default:
            console.log(error)
        }
    }
}

 
}

run();