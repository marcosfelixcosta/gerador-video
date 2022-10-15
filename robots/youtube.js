const express = require("express")
const google = require('googleapis').google
const youtube = google.youtube ({version: 'v3'})
const OAuth2 = google.auth.OAuth2
const state = require ('./state.js')
const fs =  require ('fs')

//Inicio robo de video - youtube
async function robot(){
  console.log('> [Robo do youtube] Iniciando...')
 const content  = state.load()

 await authenticateWithOAuth()
const videoInformation =  await uploadVideo(content)
await uploadThumbnail(videoInformation)

async function authenticateWithOAuth(){
const webServer = await startWebserver()
const OAuthClient = await createOAuthClient()
requestUserConsent(OAuthClient)
const authorizationToken = await waitForGoogleCallback(webServer)
await requestGoogleForAccessTokens(OAuthClient,authorizationToken)
await setGlobalGoogleAuthentication(OAuthClient)
await stopWebServer(webServer)

async function startWebserver() {
  return new Promise((resolve, reject) =>{
  const port  = 5000
  const app   = express()

  const server = app.listen(port,() =>{
    console.log(`> [youtube-robot] Listening on http://localhost:${port}`)
    resolve({
      app,
      server
      })
     })
    })
   }

   async function   createOAuthClient(){
     const credentials = require('../credentials/google-youtube.json')

     const OAuthClient = new OAuth2(
       credentials.web.client_id,
       credentials.web.client_secret,
       credentials.web.redirect_uris[0]
     )
     return OAuthClient
   }

   function requestUserConsent(OAuthClient) {
     const consentUrl = OAuthClient.generateAuthUrl({
       access_type: 'offline',
       scope: ['https://www.googleapis.com/auth/youtube']

     })
     console.log(`>[Robo do youtube] Por favor libere meu acesso!: ${consentUrl}`)
   }

   async function waitForGoogleCallback(webServer) {
     return new Promise((resolve, reject) =>{
       console.log('>[Robo do youtube] Esperando acesso!...')

       webServer.app.get('/oauth2callback', (req, res) => {
         const authCode = req.query.code
         console.log(`>[Robo do youtube] Autorizado: ${authCode}`)

         res.send('<h1> Obrigado!</h1> <p> Agora você pode fechar esta aba.</p>')
         resolve(authCode)
       })
     })
   }

   async function requestGoogleForAccessTokens(OAuthClient, authorizationToken) {
     return new Promise ((resolve, reject) =>{
       OAuthClient.getToken(authorizationToken, (error, tokens) =>{
       if (error) {
         return reject(tokens)
       }
        console.log('>[Robo do youtube] Acesso ao tokens recebido:')
        console.log(tokens)

        OAuthClient.setCredentials(tokens)
        resolve()

       })
     })
   }

   function setGlobalGoogleAuthentication(OAuthClient){
     google.options({auth: OAuthClient})
    }

    async function stopWebServer(webServer){
      return new Promise((resolve, reject) => {
        webServer.server.close(() => {
        resolve()
        })
      })
    }
  }
 //----
 async function uploadVideo(content) {
  const videoFilePath = './content/output.mov'
  const videoFileSize = fs.statSync(videoFilePath).size
  const videoTitle = `${content.prefix} ${content.searchTerm}`
  const videoTags = [content.searchTerm, ...content.sentences[0].keywords]
  const videoDescription = content.sentences.map((sentence) => {
    return sentence.text
  }).join('\n\n')

  const requestParameters = {
    part: 'snippet, status',
    requestBody: {
      snippet: {
        title: videoTitle,
        description: videoDescription,
        tags: videoTags
      },
      status: {
        privacyStatus: 'unlisted'
      }
    },
    media: {
      body: fs.createReadStream(videoFilePath)
    }
  }

  console.log('> [Robo do youtube] Iniciando o upload do video para o YouTube')
  const youtubeResponse = await youtube.videos.insert(requestParameters, {
    onUploadProgress: onUploadProgress
  })

  console.log(`> [Robo do youtube] Video disponivel em : https://youtu.be/${youtubeResponse.data.id}`)
  return youtubeResponse.data

  function onUploadProgress(event) {
    const progress = Math.round( (event.bytesRead / videoFileSize) * 100 )
    console.log(`> [Robo do youtube] ${progress}% completo`)
  }

}


async function uploadThumbnail(videoDescription) {
  const videoId = videoInformation.id
  const videoThumbnailFilePath = './content/youtube-thumbnail.jpg'
  const requestParameters = {
    videoId: videoId,
    media:{nimeType: 'image/jpg',
  body: fs.createReadStream(videoThumbnailFilePath)
   }
  }
  const youtubeResponse = await youtube.thumbnails.set(requestParameters)
  console.log('> [Robo do youtube]  uploaded do Thumbnail!')
}
 //---

}
module.exports = robot
