const readline  = require('readline-sync')
const state     = require('./state.js')

function robot(){
  const content = {
    useFecthContentFromWikipediaAlgorithmia: false,
    maximumSentences:7
  }
  
  content.searchTerm = askAndReturnSearchTerm()
  content.prefix = askAndReturnPrefix()
  content.lang = askAndReturnLanguage() //lang
  state.save(content)
  
  function askAndReturnSearchTerm() {
    return readline.question('Informe uma termo para pesquisa no Wikipedia:')
   
   }
   
   function askAndReturnPrefix() {
    const prefixes = ['Quem é', 'O que é','História']
    const selectedPrefixIndex = readline.keyInSelect(prefixes,'Selecione uma opção:')
    const selectedPrefixText  = prefixes[selectedPrefixIndex]
   
    return selectedPrefixText
    //console.log(selectedPrefixText)
   
   }
   function askAndReturnLanguage(){
		const language = ['pt','en', 'es']
		const selectedLangIndex = readline.keyInSelect(language,'Escolha o idioma: ')
		const selectedLangText = language[selectedLangIndex]
		return selectedLangText
	  }
}

module.exports  = robot

