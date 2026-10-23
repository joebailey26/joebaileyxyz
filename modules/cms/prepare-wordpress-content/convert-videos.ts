import { load } from 'cheerio'

// Videos stay on the CMS media URLs (R2). preload="metadata" lets browsers show the first frame.
export default function prepareVideos (postContent: string): string {
  const regex = /<video.*?>/g
  const matches = postContent.match(regex)
  if (!matches) {
    return postContent
  }
  const $ = load(postContent, null, false)

  // add class to <figure> elements that contain an <video>
  $('figure:has(video)').addClass('wp-block-video')

  $('video').each((i, elem) => {
    const videoUrl = $(elem).attr('src') || $(elem).find('source').attr('src')
    if (!videoUrl) {
      return
    }
    const video = $('<video controls playsinline preload="metadata"></video>')
    video.append($('<source type="video/mp4">').attr('src', videoUrl))
    const fallback = $('<p>Your browser doesn\'t support HTML5 video. Here is a <a>link to the video</a> instead.</p>')
    fallback.find('a').attr('href', videoUrl)
    video.append(fallback)
    $(elem).replaceWith(video)
  })

  // Return the blog post html
  return $.html()
}
