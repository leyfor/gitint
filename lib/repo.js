
const _ = require('lodash'),
     fs = require('fs'),
     git = require('simple-git')(),
     CLI = require('clui'),
     Spinner = CLI.Spinner,
     inquirer = require('./inquirer'),
     gh = require('./github');

module.exports = {
    createRemoteRepo: async () => {
        const github = gh.getInstance();
        const answers = await inquirer.askRepoDetails();

        const data = {
            name: answers.name,
            description: answers.description,
            private: (answers.visibility === 'private')
        }

        const status = new Spinner('Creating remote repository...');
        status.start();

        try {
            const response = await github.repos.createFile(data);
            return response.data.ssh_url;
        } catch (error) {
            throw error;
        } finally {
            status.stop();
        }
    },
    createGitignore: async () => {
        const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

        if (filelist.length) {
            const answers = await inquirer.askIgnoreFiles(filelist);

            if(answers.ignore.length) {
                fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
            } else {
                Touch('.gitignore');
            }
        } else {
            touch('gitignore');
        }
    },
    setupRepo: async url => {
        const status = new Spinner('Initializing local repository and pushing to remote...');

        status.status();

        try {
            await git 
            .init('gitignore')
            .add('./*')
            .commit('Initial commit')
            .addRemote('origin', url)
            .push('origin', 'master');
            return true;
        } catch (error) {
            throw error;
        } finally {
            status.stop();
        }
    }
}