const gm = require('gm').subClass({imageMagick: true})
const state = require('./state.js')
const spawn = require('child_process').spawn
const path = require('path')
const os = require('os');
const rootPath = path.resolve(__dirname, '..')




async function robot(){
  console.log('> [Robo de video] Iniciando...')
  const content = state.load()


 await convertAllImages(content)
 await createSentenceImages(content)
 await createYoutubeThumbnail()

await createAfterEffectScript(content)

await renderVideoWithAfterEffects()


 state.save(content)

 async function convertAllImages(content){
  for(let sentenceIndex = 0; sentenceIndex <content.sentences.length;sentenceIndex++) {
    await convertImage(sentenceIndex)
  }

 }

async function convertImage(sentenceIndex){
 return new Promise((resolve, reject) =>{
   const inputFile = `./content/${sentenceIndex}-original.png[0]`
   const outputFile = `./content/${sentenceIndex}-converted.png`
   const width = 1920
   const height = 1080
   gm()
   .in(inputFile)
   .out('(')
     .out('-clone')
     .out('0')
     .out('-background', 'white')
     .out('-blur', '0x9')
     .out('-resize', `${width}x${height}^`)
   .out(')')
   .out('(')
     .out('-clone')
     .out('0')
     .out('-background', 'white')
     .out('-resize', `${width}x${height}`)
   .out(')')
   .out('-delete', '0')
   .out('-gravity', 'center')
   .out('-compose', 'over')
   .out('-composite')
   .out('-extent', `${width}x${height}`)
   .write(outputFile, (error) => {
     if (error) {
       return reject(error)
     }
    // console.log(`> Image converted: ${inputFile}`)
    console.log(`> [Robo de video] Imagem convertida: ${outputFile}`)
     resolve()
   })

 })
}

async function createSentenceImages(content){
 for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
 await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)

 }
}

async function createSentenceImage(sentenceIndex, sentenceText) {
 return new Promise((resolve, reject) => {
 const outputFile = `./content/${sentenceIndex}-sentence.png`

 const templateSettings = {
   0: {
     size: '1920x400',
     gravity: 'center'
   },
   1: {
     size: '1920x1080',
     gravity: 'center'
   },
   2: {
     size: '800x1080',
     gravity: 'west'
   },
   3: {
     size: '1920x400',
     gravity: 'center'
   },
   4: {
     size: '1920x1080',
     gravity: 'center'
   },
   5: {
     size: '800x1080',
     gravity: 'west'
   },
   6: {
     size: '1920x400',
     gravity: 'center'
   }

 }

 gm()
   .out('-size', templateSettings[sentenceIndex].size)
   .out('-gravity', templateSettings[sentenceIndex].gravity)
   .out('-background', 'transparent')
   .out('-fill', 'white')
   .out('-kerning', '-1')
   .out(`caption:${sentenceText}`)
   .write(outputFile, (error) => {
     if (error) {
       return reject(error)
     }

     console.log(`> [Robo de video] Sentença creada: ${outputFile}`)
     resolve()
})

})
}

async function createYoutubeThumbnail() {
return new Promise((resolve, reject) => {
 gm()
 .in('./content/0-converted.png')
 .write('./content/youtube-thumbnail.jpg', (error) => {

   if (error) {
     return reject(error)
   }

   console.log('> [Robo de video] YouTube thumbnail criado')
   resolve()
   })

 }) 
 
}

async function createAfterEffectScript(content) {
  await state.saveScript(content)
}
async function renderVideoWithAfterEffects() {
  return new Promise((resolve, reject) => {

    const aerenderFilePath = 'C:\\Program Files\\Adobe\\Adobe After Effects CC 2019\\Support Files\\aerender.exe'  //'%ProgramFiles%\Adobe\Adobe After Effects CC 2019\Support Files\aerender.exe'//'/Applications/Adobe After Effects CC 2019/aerender'
    const templateFilepath = `${rootPath}/templates/1/template.aep`
    const destinationFilepath = `${rootPath}/content/output.mov`

    console.log('> [video-robot] Starting Affter Affects')

    const aerender = spawn(aerenderFilePath, [
      '-comp','main',
      '-project', templateFilepath,
      '-output', destinationFilepath
    ])
  aerender.stdout.on('data', (data)=>{
    process.stdout.write(data)
  })
  aerender.on('close', () =>{
    console.log('> [Robo de video] After Effects fechado')
    resolve()
  })
  })
}

}
module.exports = robot