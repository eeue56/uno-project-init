#!/usr/bin/env node

const yargs = require('yargs');
const fs = require('fs-extra');
const spawn = require('child_process').spawnSync;


const travisYaml = function(projectName, platform){
	return `
os:
  - osx

env:
  global:
    - XCODE_XCCONFIG_FILE=$TRAVIS_BUILD_DIR/.travis.xcconfig

install:
  - wget https://www.fusetools.com/downloads/latest/beta/osx -O fuse-installer.pkg
  - sudo installer -pkg fuse-installer.pkg -target /

script:
  - uno build ${projectName}/${projectName}.unoproj
  - uno build -t${platform} Example/Example.unoproj
`.trim();
};

const travisXCode = function() {
	return "SDKROOT = iphonesimulator";
};


const gitignore = function(){
	return `
build
.build
.uno
.cache
`.trim();
};

const mainView = function(){
	return `
<App Background="#eee">
</App>
`.trim();
}


const needsGitIgnore = function(){
	return !fs.existsSync('.gitignore');
};

const writeGitIgnore = function(isVerbose) {
	if (needsGitIgnore()){
		if (isVerbose) console.log('Creating .gitignore..');

		fs.outputFileSync('.gitignore', gitignore());
	} else {
		if (isVerbose) console.log('.gitignore found! Not modifying');
	}
};


const needsTravisYml = function(){
	return !fs.existsSync('.travis.yml');
};

const writeTravisYml = function(isVerbose, projectName, platform){
	if (platform == null) platform = "ios";

	if (needsTravisYml()){
		if (isVerbose) console.log('Creating .travis.yml and .travis.xcconfig..');

		fs.outputFileSync('.travis.yml', travisYaml(projectName, platform));
		fs.outputFileSync('.travis.xcconfig', travisXCode());
	} else {
		if (isVerbose) console.log('.travis.yml found! Not modifying');
	}
};


const runUnoCreate = function(isVerbose, projectName, unoPath){
	if (isVerbose) console.log(`Creating ${projectName}/${projectName}.unoproj`);

	const unoCommand = spawn(unoPath, ['create', projectName]);

	if (isVerbose){
		if (unoCommand.stdout !== null) console.log(unoCommand.stdout.toString());
		if (unoCommand.stderr !== null) console.error(unoCommand.stderr.toString());
	}
};

const writeExample = function(isVerbose, projectName, unoPath){
	if (isVerbose) console.log(`Creating Example/Example.unoproj`);

	const unoCommand = spawn(unoPath, ['create', "Example"]);
	if (isVerbose){
		if (unoCommand.stdout !== null) console.log(unoCommand.stdout.toString());
		if (unoCommand.stderr !== null) console.error(unoCommand.stderr.toString());
	}

	const unoproj = fs.readJsonSync("Example/Example.unoproj");
	unoproj['Projects'] = [ `../${projectName}/${projectName}.unoproj`];
	fs.writeJsonSync("Example/Example.unoproj", unoproj);


	if (isVerbose) console.log(`Creating Example/MainView.ux`);

	fs.outputFileSync("Example/MainView.ux", mainView());
};


const main = function() {
	const argv = yargs
		.usage('Usage: $0 <project name>')
		.alias('v', 'verbose')
		.describe('v', 'Output more stuff')
		.alias('t', 'target')
		.describe('t', 'Choose target platform. Defaults to ios')
		.alias('u', 'uno')
	    .describe('uno', 'Specify a path to the `uno` binary')
	    .example('$0 --uno ~/dev/uno/uno', 'Use `uno create` using the binary provided')
		.help('h')
	    .alias('h', 'help')
		.argv;

	const isVerbose = typeof argv.verbose !== "undefined" && argv.verbose;
	var platform = "ios";
	if (typeof argv.target !== "undefined"){
		platform = argv.target;
	} 

	var unoPath = argv.uno;
	if (typeof unoPath == "undefined" || !unoPath){
	    unoPath = "uno";
	}

	const projectName = argv._[0];

	if (typeof projectName === "undefined"){
		console.error("Please pass a project name!");
		return -1;
	}

	writeGitIgnore(isVerbose);
	writeTravisYml(isVerbose, projectName, platform);
	runUnoCreate(isVerbose, projectName, unoPath);
	writeExample(isVerbose, projectName, unoPath);
};


main();