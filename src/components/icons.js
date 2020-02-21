/* 
  Button Component
  Props:
    items - Number of icons to render
*/
import React from 'react';

import './css/icons.scss';

function createIcon(v) {
    let icon = []
    let h = v - 1

    for (let i = 0; i < h; i++) {
        icon.push(<div className="icon" key={Math.random()}></div>)
    }
    return icon
}

function Icons(props) {

  return (
    <div className="icons">
        <div className="icon current"></div>
        {createIcon(props.items)}
    </div>
  )
}

export default Icons;