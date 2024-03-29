const imageDownloader = require('image-downloader')
const google  = require('googleapis').google
const customSearch  = google.customsearch('v1')
const state = require('./state.js')


//Chave-reserva - Busca no google:
//  "AIzaSyASu336Pvs_8a7XE8OfkamGZ6767e2-wM4U_htVM"
//  "AIzaSyC1Y_ML337MWtuIlJvX8ZAkJl056ujxQKPZJ08"
//  "AIzaSyBSf33YngZq1KAffFb3XvUI45KGDlciiFtV3oI"



const googleSearchCredentials = require('../credentials/google-seach.json')

async function robot() {
  console.log('> [Robo de imagem] Iniciando...')
    const content = state.load()

 await fetchImagesOfAllSentences(content)
 await downloadAllImages(content)

//  await convertAllImages(content)
//  await createSentenceImages(content)
//  await createYoutubeThumbnail()

  state.save(content)
  async function fetchImagesOfAllSentences(content) {
    for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
      let query

      if (sentenceIndex === 0) {
        query = `${content.searchTerm}`
      } else {
        query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`
      }

      console.log(`> [Robo de imagem] Consultando Imagens do Google com: "${query}"`)

      content.sentences[sentenceIndex].images = await fetchGoogleAndReturnImagesLinks(query)
      content.sentences[sentenceIndex].googleSearchQuery = query
    }
  }

async function fetchGoogleAndReturnImagesLinks(query) {
  const response  = await customSearch.cse.list({
    auth: googleSearchCredentials.apiKey,
    cx: googleSearchCredentials.searchEngineId,
    q: query,
    searchType: 'image',
    num: 2
  })
  const imagesUrl = response.data.items.map((item) => { 
   return  item.link
 
 })
  return  imagesUrl
 }
 
 async function downloadAllImages(content){
   content.downloadAllImages  = []
 
//content.sentences[1].images[0]  = ''

 for(let sentenceIndex  = 0; sentenceIndex < content.sentences.length; sentenceIndex++ ) {
 const images = content.sentences[sentenceIndex].images

 for(let imageIndex = 0; imageIndex < images.length; imageIndex++) {
   const imageUrl = images[imageIndex]

   try {
     if (content.downloadAllImages.includes(imageUrl)){
       throw new Error ('Já baixei esta imagens!')
     }
     await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
     content.downloadAllImages.push(imageUrl)
     console.log(`> [Robo de imagem] [${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
     break
   } catch (error) {
    console.log(`>[Robo de imagem] [${sentenceIndex}][${imageIndex}] Erro ao baixar a imagem: (${imageUrl}): ${error}`)
     
    }
    }
    }
    }

    async function downloadAndSave(url, fileName) {
      return imageDownloader.image({
        url: url, dest: `./content/${fileName}`
      })
    }

//     async function convertAllImages(content){
//      for(let sentenceIndex = 0; sentenceIndex <content.sentences.length;sentenceIndex++) {
//        await convertImage(sentenceIndex)
//      }

//     }
//   async function convertImage(sentenceIndex){
//     return new Promise((resolve, reject) =>{
//       const inputFile = `./content/${sentenceIndex}-Original.jpg[0]`
//       const outputFile = `./content/${sentenceIndex}-convertido.jpg`
//       const width = 1920
//       const height = 1080
//       gm()
//       .in(inputFile)
//       .out('(')
//         .out('-clone')
//         .out('0')
//         .out('-background', 'white')
//         .out('-blur', '0x9')
//         .out('-resize', `${width}x${height}^`)
//       .out(')')
//       .out('(')
//         .out('-clone')
//         .out('0')
//         .out('-background', 'white')
//         .out('-resize', `${width}x${height}`)
//       .out(')')
//       .out('-delete', '0')
//       .out('-gravity', 'center')
//       .out('-compose', 'over')
//       .out('-composite')
//       .out('-extent', `${width}x${height}`)
//       .write(outputFile, (error) => {
//         if (error) {
//           return reject(error)
//         }
//         console.log(`> Image converted: ${inputFile}`)
//         resolve()
//       })

//     })
//   }

//   async function createSentenceImages(content){
//     for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
//     await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)

//     }
//   }

//   async function createSentenceImage(sentenceIndex, sentenceText) {
//     return new Promise((resolve, reject) => {
//     const outputFile = `./content/${sentenceIndex}-sentence.png`

//     const templateSettings = {
//       0: {
//         size: '1920x400',
//         gravity: 'center'
//       },
//       1: {
//         size: '1920x1080',
//         gravity: 'center'
//       },
//       2: {
//         size: '800x1080',
//         gravity: 'west'
//       },
//       3: {
//         size: '1920x400',
//         gravity: 'center'
//       },
//       4: {
//         size: '1920x1080',
//         gravity: 'center'
//       },
//       5: {
//         size: '800x1080',
//         gravity: 'west'
//       },
//       6: {
//         size: '1920x400',
//         gravity: 'center'
//       }

//     }

//     gm()
//       .out('-size', templateSettings[sentenceIndex].size)
//       .out('-gravity', templateSettings[sentenceIndex].gravity)
//       .out('-background', 'transparent')
//       .out('-fill', 'white')
//       .out('-kerning', '-1')
//       .out(`caption:${sentenceText}`)
//       .write(outputFile, (error) => {
//         if (error) {
//           return reject(error)
//         }

//         console.log(`> [video-robot] Sentence created: ${outputFile}`)
//         resolve()
//   })

// })
// }
// async function createYoutubeThumbnail() {
//   return new Promise((resolve, reject) => {
//     gm()
//     .in('./content/0-convertido.jpg')
//     .write('./content/youtube-thumbnail.jpg', (error) => {

//       if (error) {
//         return reject(error)
//       }

//       console.log('> [video-robot] YouTube thumbnail created')
//       resolve()
//       })

//     }) 
    
//   }
}

module.exports  = robot
