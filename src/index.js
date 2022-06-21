const vscode = require('vscode')


function get_hover_word(document, position) {
    let hover_word

    // 首先判定position是否在selection范围内
    let selection = vscode.window.activeTextEditor.selection;
    if (selection.start.line == selection.end.line &&
        selection.end.line == position.line &&
        selection.start.character <= position.character &&
        selection.end.character >= position.character
    ) {
        hover_word = document.getText(selection);
    }
    // 否则，分析position指向的单词
    else {
        let range = document.getWordRangeAtPosition(position)
        hover_word = document.getText(range)
    }
    return hover_word
}

function convert(text) {
    // 分析text是否是时间戳
    let n = text.search(/\D/i)
    if (n == -1)
        return new Date(parseInt(text) * 1000).toLocaleString()
}

function init() {
    vscode.languages.registerHoverProvider('*', {
        async provideHover(document, position) {
            const config = vscode.workspace.getConfiguration('timestamp', document.uri)

            let isOpen = config.get('open')
            if (!isOpen) return

            let languageId = document.languageId
            let disableOnLanguage = config.get("disableOnLanguage")
            if (disableOnLanguage.indexOf(languageId) !== -1) return
            let languages = config.get("activationOnLanguage")
            if (languages.indexOf("*") == -1 && languages.indexOf(languageId) == -1) return

            let hover_word = get_hover_word(document, position)
            let time_s = convert(hover_word)
            if (time_s) return new vscode.Hover(`#### 时间戳转换\n${time_s}`)
        }
    })
}

module.exports = {
    init
}