import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import sharp from 'sharp'

export default class HandleExternalImage {
  constructor (externalImgUrl, outputDirectory, outputFileNameWithoutExtension = null, width = null, height = null, alt = '') {
    this.externalImgUrl = externalImgUrl
    this.outputDirectory = outputDirectory
    this.outputFileName = encodeURIComponent(outputFileNameWithoutExtension ? outputFileNameWithoutExtension + '.png' : path.basename(externalImgUrl)).toLowerCase()
    this.outputFileExtension = path.extname(this.outputFileName)
    this.outputFileNameWithoutExtension = path.basename(this.outputFileName, this.outputFileExtension)
    this.pathToOutput = path.join(__dirname, '..', '..', '..', 'static', 'img', this.outputDirectory)
    this.fullOutputPath = path.join(this.pathToOutput, this.outputFileName)
    this.fullOutputPathAvif = path.join(this.pathToOutput, this.outputFileNameWithoutExtension + '.avif')
    this.fullOutputPathWebp = path.join(this.pathToOutput, this.outputFileNameWithoutExtension + '.webp')
    this.width = width
    this.height = height
    this.alt = alt
  }

  async resizeImage (input) {
    const fileExtension = path.extname(input)
    const fileNameWithoutExtension = encodeURIComponent(path.basename(input, fileExtension)).toLowerCase()
    const resizedFilePath = path.join(this.pathToOutput, fileNameWithoutExtension + '_resized' + fileExtension)
    if (!(fs.existsSync(resizedFilePath))) {
      if (this.width && this.height) {
        await sharp(input)
          .resize({
            height: this.height,
            width: this.width,
            fit: sharp.fit.inside,
            withoutEnlargement: true
          })
          .toFile(resizedFilePath)
        return resizedFilePath
      } else if (this.width) {
        await sharp(input)
          .resize({
            width: this.width,
            fit: sharp.fit.inside,
            withoutEnlargement: true
          })
          .toFile(resizedFilePath)
        return resizedFilePath
      } else if (this.height) {
        await sharp(input)
          .resize({
            height: this.height,
            fit: sharp.fit.inside,
            withoutEnlargement: true
          })
          .toFile(resizedFilePath)
        return resizedFilePath
      }
      return input
    }
    return resizedFilePath
  }

  async loadImage () {
    // If the image already exists, we don't need to fetch it again
    if (!(fs.existsSync(this.fullOutputPath))) {
    // Use fetch to download image
      await fetch(this.externalImgUrl)
        .then((response) => response.buffer())
        .then((buffer) => fs.promises.writeFile(this.fullOutputPath, buffer))
    }
    this.fullOutputPath = await this.resizeImage(this.fullOutputPath)
  }

  // Convert to avif if the file doesn't already exist
  async convertToAvif () {
    // Check if the file already exists
    if (!(fs.existsSync(this.fullOutputPathAvif))) {
    // Use sharp to convert image to avif
      await sharp(this.fullOutputPath)
        .toFormat('avif')
        .toFile(this.fullOutputPathAvif)
    }
    this.fullOutputPathAvif = await this.resizeImage(this.fullOutputPathAvif)
  }

  // Convert to webp if the file doesn't already exist
  async convertToWebP () {
    // Check if the file already exists
    if (!(fs.existsSync(this.fullOutputPathWebp))) {
    // Use sharp to convert image to webp
      await sharp(this.fullOutputPath)
        .toFormat('webp')
        .toFile(this.fullOutputPathWebp)
    }
    this.fullOutputPathWebp = await this.resizeImage(this.fullOutputPathWebp)
  }

  async generatePictureElement () {
    await this.loadImage()
    this.localAvifPath = await this.convertToAvif()
    this.localWebpPath = await this.convertToWebP()
    const localAvif = `/img/${this.outputDirectory}/${path.basename(this.fullOutputPathAvif)}`
    const localWebp = `/img/${this.outputDirectory}/${path.basename(this.fullOutputPathWebp)}`

    return `
    <picture>
      <source type="image/avif" srcset="${localAvif}" width="${this.width ? this.width : 'auto'}" height="${this.height ? this.height : 'auto'}">
      <img
        src="${localWebp}"
        decoding="async"
        loading="lazy"
        alt="${this.alt}"
        width="${this.width ? this.width : 'auto'}"
        height="${this.height ? this.height : 'auto'}"
        fetchpriority="auto"
      >
    </picture>
  `
  }
}
