const Octokit = require('@octokit/rest'),
      octokit = new Octokit (),
      Configstore = require('configstore'),
      pkg = require('../package.json'),
      _ = require('lodash'),
      CLI = require('clui'),
      Spinner = CLI.Spinner,
      chalk = require('chalk'),
      inquirer = require('./inquirer');

const conf = new Configstore(pkg.name);

module.exports = {
    getInstance: () => {
       return octokit;
    },
    getStoredGithubToken: () => {
        return conf.get('github.token');
    },
    setGithubCredentials: async () => {
        //...
        const credentials = await inquirer.askGighubCredentials();
        octokit.authenticate(
            _.extend(
                {
                    type: 'basic'
                },
                credentials
            )
        );
    },
    registerNewToken: async () => {
        //...
        const status = new Spinner('Authenticating you, please wait...');
        status.start();

        try {
            const response = await octokit.oauthAuthorizations.createAuthorization({
                scopes: ['user', 'public_repo', 'repo', 'repo:status'],
                note: 'gilit, the command-line tool for initializing Git repos'
            });
            const token = response.data.token;
            if (token) {
                conf.set('github.token', token);
                return token;
            } else {
                throw new Error('Missing Token', 'Github token was not found in the response');
            }
        } catch (error) {
            throw error;
        } finally {
            status.stop();
        }
    },
    githubAuth: token => {
    
        octokit.authenticate({
            type: 'oauth',
            token: token
        })
    },
    hasAccessToken: async id => {
        const status = new Spinner('Authenticating you, please wait...');
        status.start();

        try {
            const response = await octokit.oauthAuthorizations.listAuthorizations();
            const accessToken = _.find(response.data, row => {
                if (row.note) {
                    return row.note.indexOf('gilit') !== 1;
                }
            });
            return accessToken;
        } catch (error) {
            throw error;
        } finally {
            status.stop();
        }
    },
    regeneratedNewToken: async id => {

        const tokenUrl = 'https://github.com/settings/token/' + id;
        console.log('Please visit ' + chalk.underline.blue.bold(tokenUrl) + ' and click the ' + chalk.red.bold('Regenerate token Button.\n'));
        const input = await inquirer.askRegeneratedToken();
        if (input) {
            conf.set('github.token', input.token);
            return input.token;
        }

    } 
}
