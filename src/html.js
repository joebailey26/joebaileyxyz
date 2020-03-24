import React from "react"
import PropTypes from "prop-types"
import Footer from "./components/footer"

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="description" content="Joe Bailey is a web developer and photographer currently living in Southampton studying at Solent University."/>
        <meta property="og:image" content="assets/img/header.jpg"/>
        <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png"/>
        <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png"/>
        <link rel="manifest" href="manifest.json"/>
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#004c3f"/>
        <meta name="msapplication-TileColor" content="#004c3f"/>
        <meta name="theme-color" content="#282828"/>
        
        <link href="https://fonts.googleapis.com/css?family=Roboto+Slab:700|Roboto:300,400&display=swap" rel="stylesheet"/>
          
        <link rel="canonical" href="https://joebailey.xyz"/>

        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  )
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}
