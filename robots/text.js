const algorithmia     = require('algorithmia')
const algorithmApiKey = require('../credentials/algorithmia.json').apikey
const sentenceBoundaryDetection = require('sbd')
//const fetch = require('node-fetch')


const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const  { IamAuthenticator } = require('ibm-watson/auth');
 
const nlu = new NaturalLanguageUnderstandingV1({
 // authenticator: watsonApiKey,
  authenticator: new IamAuthenticator({ apikey: watsonApiKey}),
  //authenticator: new IamAuthenticator({ apikey: '<apikey>' }),
  version: '2018-04-05',
  url: 'https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/'
})

const state = require('./state.js')

async function robot () {
  console.log('> [Robo de texto] Iniciando...')
  const content = state.load()
 await fetchContentFromwikipedia(content)
  sanitizeContente(content)
 breakContentIntoSentences(content)
 limiteMaximumSentences(content)
 await fetchKeywordsOfAllSentences(content)

 state.save(content)
//console.log('Logando funcao "fetchContentFromwikipedia" retona')
//console.log(fetchContentFromwikipedia())


async function fetchContentFromwikipedia(content) {
  const algorithmiaAuthenticated = algorithmia(algorithmApiKey)
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
  //const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
  const wikipediaResponse = await wikipediaAlgorithm.pipe({
    "articleName": content.searchTerm,
    "lang": content.lang
  })
  const wikipediaContent = wikipediaResponse.get()

  content.sourceContentOriginal = wikipediaContent.content
}



/*
async function fetchContentFromwikipedia(content) {
  const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
  const wikipediaResponde = await wikipediaAlgorithm.pipe({
    "lang" : content.lang,
    "articleName": content.searchTerm
  })
  const wikipediaContent = wikipediaResponde.get()
  content.sourceContentOriginal = wikipediaContent.content
}
*/
 

/*
async function fetchContentFromwikipedia(content) {
const algorithmiaAuthenticated = algorithmia(algorithmApiKey)
const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
const wikipediaResponde  = await wikipediaAlgorithm.pipe(content.searchTerm)
const wikipediaContent   = wikipediaResponde.get()

content.sourceContentOriginal  =  wikipediaContent.content
console.log('> [text-robot] Fetcghing done!')

 }

 */
function sanitizeContente(content){
  const withouBlankLinesAndMarkdown  = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
  const withouDatesInparentheses     = removeDatesInParentheses(withouBlankLinesAndMarkdown)
  
  //content.sourceContentSanitalized   = withouDatesInparentheses
  content.sourceContentSanitized = withouDatesInparentheses
 
 // console.log(withouDatesInparentheses)


  function removeBlankLinesAndMarkdown(text) {
  const allLines  = text.split('\n')
  
  const withouBlankLinesAndMarkdown  = allLines.filter((line) => {
    if (line.trim().length === 0 || line.trim().startsWith('=')) {
    
      return false
    }
    return true
  })
  
    return withouBlankLinesAndMarkdown.join(' ')
     
 }
}

 function removeDatesInParentheses(text){

  return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
 }

 function breakContentIntoSentences(content) {
  content.sentences = []

  const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
  //console.log(sentences)
  sentences.forEach((sentence) => {
    content.sentences.push({
      text: sentence,
      keywords: [],
      images: []
    })
  })
}

function limiteMaximumSentences(content) {
content.sentences = content.sentences.slice(0, content.maximumSentences)
//content.sentences = content.sentences.slice(0, content.maximumSentences)

}

async function fetchKeywordsOfAllSentences(content) {
  console.log('> [Robo de texto] Começando a buscar palavras-chave no Watson')

  for (const sentence of content.sentences) {
   console.log(`> [Robo de texto] Sentença: "${sentence.text}"`)

    sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

    console.log(`> [Robo de texto] Palavra chave: ${sentence.keywords.join(', ')}\n`)
  }
}

async function fetchWatsonAndReturnKeywords(sentence) {
  return new Promise((resolve, reject) =>{
    nlu.analyze({
      text: sentence,
      features: {
        keywords: {}
      }
    }, (error, response) => {
      if (error) {
        reject(error)
        return
      }

      const keywords = response.result.keywords.map((keyword) => {
        return keyword.text
      })

      resolve(keywords)
 
    //console.log(JSON.stringify(Response, null,4))
   //process.exit(0)
        
   })
  })
  
 }

}
 //console.log (`Recebi com sucesso: ${content.searchTerm}`)
module.exports = robot
