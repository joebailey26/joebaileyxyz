/* 
  Button Component
  Props:
    link
    text
    type
  If type is secondary then component adds the secondary class to the button
*/
import React from 'react'

import './css/button.scss'

let className

function Button(props) {
  if (props.type === "Secondary") {
    className = "btn secondary"
  } else {
    className = "btn"
  }
  return (
    <a className={className} href={props.link}>{props.text}</a>
  )
}

export default Button;
