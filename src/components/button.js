/* 
  Button Component
  Props:
    link
    text
    type
  If type is secondary then component adds the secondary class to the button
*/
import React from 'react'

import { Link } from 'gatsby'

import './css/button.scss'

let className

function Button(props) {
  if (props.type === "Secondary") {
    className = "btn secondary"
  } else {
    className = "btn"
  }
  return (
    <Link className={className} to={props.link}>{props.text}</Link>
  )
}

export default Button;
