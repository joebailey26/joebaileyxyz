import React from 'react';

let className

function Button(props) {
  if (props.type === "Secondary") {
    className = "btn secondary"
  } else {
    className = "btn"
  }
  return (
    <a className={className} rel="noopener noreferrer" target="_blank" href={props.link}>{props.text}</a>
  )
}

export default Button;
