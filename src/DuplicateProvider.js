const vscode = require('vscode')

class DuplicateDataProvider {
  constructor() {
    this.data = []

    this._onDidChangeTreeData = new vscode.EventEmitter()
  }

  getTreeItem(element) {
    return element
  }

  getChildren(element) {
    if (element === undefined) {
      return this.data
    }
    return element.children
  }

  addItem(match) {
    const code = match.instances[0].lines.split('\n')[0]
    this.data.push(new DuplicateItem(
      `Duplicated ${match.instances.length} times: ${code}`,
      match.instances.map(t => new DuplicateItem(`${vscode.workspace.asRelativePath(t.filename)}:${t.start.line}-${t.end.line}`))))
  }

  clear() {
    this.data = []
    this._onDidChangeTreeData.fire(undefined)
  }

  refresh() {
    this._onDidChangeTreeData.fire(undefined)
  }

  get onDidChangeTreeData() {
    return this._onDidChangeTreeData.event
  }

  // onDidChangeTreeData() {
  // }
}

class DuplicateItem extends vscode.TreeItem {
  constructor(label, children) {
    super(
      label,
      children === undefined ? vscode.TreeItemCollapsibleState.None :
        vscode.TreeItemCollapsibleState.Expanded)
    this.children = children
  }
}

module.exports = {
  DuplicateDataProvider,
  DuplicateItem
}
