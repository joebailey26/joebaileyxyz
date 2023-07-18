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
          .then((response) => response.arrayBuffer())
          .then((buffer) => fs.promises.writeFile(localAbsolutePath, buffer))
      }
      // Return a resolved promise if video already exists
      return Promise.resolve()
    }

    const saveFirstFrame = () => {
      // Check if the file already exists
      if (!(fs.existsSync(posterImageAbsolutePath))) {
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
      // Return a resolved promise if avif file already exists
      return Promise.resolve()
    }

    promises.push(loadVideo().then(saveFirstFrame))

    // Replace the video element with one that uses the local files
    $(elem).replaceWith(`
    <video controls loading="lazy" poster="/img/wordpress/${fileNameWithoutExtension}.jpg" playsinline>
      <source src="/video/wordpress/${fileName}" type='video/mp4'>
      <p>Your browser doesn't support HTML5 video. Here is a <a href="/video/wordpress/${fileName}">link to the video</a> instead.</p>
    </video>
    `)
  })
  // Load all videos
  await Promise.all(promises)
  // Return the blog post html
  return $.html()
}
