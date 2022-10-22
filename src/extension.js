// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { commands, window, workspace } = require('vscode')
const { contributes: { commands: [inspectCommand] } } = require('../package.json')

const {
  Inspector,
  reporters
} = require('jsinspect')

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "duplications-analyzer" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = commands.registerCommand(inspectCommand.command, async function () {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    window.showInformationMessage('Hello World from Duplications Analyzer!')

    let program = {
      threshold: 30,
      identifiers: false,
      literals: false,
      minInstances: 2,
      truncate: 0
    }

    const paths = await (await workspace.findFiles('**/*.js')).map(t => t.fsPath)

    let inspector = new Inspector(paths, {
      threshold:    program.threshold,
      identifiers:  program.identifiers,
      literals:     program.literals,
      minInstances: program.minInstances
    })

    // Retrieve the requested reporter
    let reporterType = reporters[program.reporter] || reporters.default
    new reporterType(inspector, {
      truncate: program.truncate
    })

    // Track the number of matches
    let matches = 0
    inspector.on('match', () => matches++)

    try {
      inspector.run()
      window.showInformationMessage(`Found duplication matches ${matches}`)
    } catch(err) {
      console.log(err)
    }
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
