import fs from 'fs'
import path from 'path'
import { load } from 'cheerio'
import fetch from 'node-fetch'
import sharp from 'sharp'

export default async function downloadAndReplaceImages (postContent) {
  const regex = /<img.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  // Replace all links around images with just the image
  $('a').each((i, elem) => {
    if ($(elem).has('img').length) {
      $(elem).replaceWith($(elem).find('img'))
    }
  })

  // add class to <figure> elements that contain an <img>
  $('figure:has(img)').addClass('wp-block-image')

  const promises = []
  // Loop through all images
  $('img').each((i, elem) => {
    // Get the attributes from the image
    const width = $(elem).attr('width')
    const height = $(elem).attr('height')
    const alt = $(elem).attr('alt')
    // Work out the image url and path
    const imgUrl = $(elem).attr('src')
    const fileExtension = path.extname(imgUrl)
    const fileName = encodeURIComponent(path.basename(imgUrl)).toLowerCase()
    const fileNameWithoutExtension = encodeURIComponent(path.basename(imgUrl, fileExtension)).toLowerCase()
    const localAbsolutePath = path.join(__dirname, '..', '..', 'static', 'img', 'wordpress', fileName)
    const localAbsoluteAvifPath = path.join(__dirname, '..', '..', 'static', 'img', 'wordpress', fileNameWithoutExtension + '.avif')
    const localAbsoluteWebPPath = path.join(__dirname, '..', '..', 'static', 'img', 'wordpress', fileNameWithoutExtension + '.webp')

    const loadImage = () => {
      // If the image already exists, we don't need to fetch it again
      if (!(fs.existsSync(localAbsolutePath))) {
        // Use fetch to download image and return promise
        return fetch(imgUrl)
          .then((response) => response.buffer())
          .then((buffer) => fs.promises.writeFile(localAbsolutePath, buffer))
      }
      // Return a resolved promise if image already exists
      return Promise.resolve()
    }

    // Convert to avif if the file doesn't already exist
    const convertToAvif = () => {
      // Check if the file already exists
      if (!(fs.existsSync(localAbsoluteAvifPath))) {
        // Use sharp to convert image to avif and return promise
        return sharp(localAbsolutePath)
          .toFormat('avif')
          .toFile(localAbsoluteAvifPath)
      }
      // Return a resolved promise if avif file already exists
      return Promise.resolve()
    }

    // Convert to webp if the file doesn't already exist
    const convertToWebP = () => {
      // Check if the file already exists
      if (!(fs.existsSync(localAbsoluteWebPPath))) {
        // Use sharp to convert image to webp and return promise
        return sharp(localAbsolutePath)
          .toFormat('webp')
          .toFile(localAbsoluteWebPPath)
      }
      // Return a resolved promise if webp file already exists
      return Promise.resolve()
    }

    promises.push(loadImage().then(convertToAvif).then(convertToWebP))

    // Replace the image element with our own picture element which uses the local and converted files
    $(elem).replaceWith(
      `<picture>
        <source type="image/avif" srcset="/img/wordpress/${fileNameWithoutExtension}.avif" width="${width}" height="${height}">
        <source type="image/webp" srcset="/img/wordpress/${fileNameWithoutExtension}.webp" width="${width}" height="${height}">
        <img
          src="/img/wordpress/${fileName}"
          decoding="async"
          loading="lazy"
          alt="${alt}"
          width="${width}"
          height="${height}"
          fetchpriority="auto"
        >
      </picture>`
    )
  })
  // Load all images
  await Promise.all(promises)
  // Return the blog post html
  return $.html()
}
