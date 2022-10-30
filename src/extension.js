// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { commands, window, workspace } = require('vscode')
const { contributes: { commands: [inspectCommand] } } = require('../package.json')

const {
  Inspector,
  reporters
} = require('jsinspect')

const { DuplicateDataProvider } = require('./DuplicateProvider')

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

let provider = new DuplicateDataProvider()

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  registerCommand(context, inspectCommand.command, analyzeDuplications)

  window.registerTreeDataProvider('duplicationsExplorer', provider)
}

/**
 * The function to analyze duplications.
 */
async function analyzeDuplications() {
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
    threshold: program.threshold,
    identifiers: program.identifiers,
    literals: program.literals,
    minInstances: program.minInstances
  })

  // Retrieve the requested reporter
  let reporterType = reporters[program.reporter] || reporters.default
  new reporterType(inspector, {
    truncate: program.truncate
  })

  // Track the number of matches
  let matches = 0
  inspector.on('match', (match) => {
    matches++
    provider.addItem(match)
  })

  inspector.on('start', () => {
    provider.clear()
  })

  inspector.on('end', () => {
    provider.refresh()
  })

  try {
    inspector.run()
    window.showInformationMessage(`Found duplication matches ${matches}`)
  } catch (err) {
    console.log(err)
  }
}

/**
 * Register a new command for the extension.
 * @param {vscode.ExtensionContext} context extension context
 * @param {string} command command name
 * @param {Function} callback command to execute
 */
function registerCommand(context, command, callback = () => { }) {
  const disposable = commands.registerCommand(command, callback)
  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
  activate,
  deactivate
}
