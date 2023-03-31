import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { load } from 'cheerio'
import fetch from 'node-fetch'
import ffmpeg from 'ffmpeg-static'

export default async function downloadAndReplaceImages (postContent) {
  const regex = /<video.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  // add class to <figure> elements that contain an <video>
  $('figure:has(video)').addClass('wp-block-video')

  const promises = []
  // Loop through all videos
  $('video').each((i, elem) => {
    // Work out the video url and path
    const videoUrl = $(elem).attr('src')
    const fileExtension = path.extname(videoUrl)
    const fileName = encodeURIComponent(path.basename(videoUrl)).toLowerCase()
    const fileNameWithoutExtension = encodeURIComponent(path.basename(videoUrl, fileExtension)).toLowerCase()
    const posterImageAbsolutePath = path.join(__dirname, '..', '..', 'static', 'img', 'wordpress', fileNameWithoutExtension + '.jpg')
    const localAbsolutePath = path.join(__dirname, '..', '..', 'static', 'video', 'wordpress', fileName)

    const loadVideo = () => {
      // If the video already exists, we don't need to fetch it again
      if (!(fs.existsSync(localAbsolutePath))) {
        // Use fetch to download video and return promise
        return fetch(videoUrl)
          .then((response) => response.buffer())
          .then((buffer) => fs.promises.writeFile(localAbsolutePath, buffer))
      }
      // Return a resolved promise if video already exists
      return Promise.resolve()
    }

    const saveFirstFrame = () => {
      return spawn(ffmpeg, [
        '-i',
        localAbsolutePath,
        '-ss',
        '00:00:00.001',
        '-vframes',
        '1',
        posterImageAbsolutePath
      ])
    }

    promises.push(loadVideo().then(saveFirstFrame))

    // Replace the video element with one that uses the local files
    $(elem).replaceWith(`
    <video controls loading="lazy" poster="/img/wordpress/${fileNameWithoutExtension}.jpg">
      <source src="/video/wordpress/${fileName}">
      <p>Your browser cannot play the provided video file.</p>
    </video>
    `)
  })
  // Load all videos
  await Promise.all(promises)
  // Return the blog post html
  return $.html()
}
