import React from 'react';

import Button from '../../components/button';

function button(link, text) {
    if (link) {
        return (
            <Button link={link} text={text}></Button>
        )
    }
}

function tech(tech) {
  if (tech) {
      let arr = [];
      for (var i = 0; i < tech.length; i++) {
          if (tech[i] === "Firebase") {
              arr.push(
                  <i key={tech[i]} title="Firebase"><i className="fab fa-google"></i></i>
              )
          }
          else if (tech[i] === "PHP") {
              arr.push(
                  <i key={tech[i]} title="PHP"><i className="fab fa-php"></i></i>
              )
          }
          else if (tech[i] === "Vue") {
              arr.push(
                  <i key={tech[i]} title="Vue"><i className="fab fa-vuejs"></i></i>
              )
          }
          else if (tech[i] === "React") {
              arr.push(
                  <i key={tech[i]} title="React"><i className="fab fa-react"></i></i>
              )
          }
          else if (tech[i] === "WordPress") {
              arr.push(
                  <i key={tech[i]} title="WordPress"><i className="fab fa-wordpress"></i></i>
              )
          }
          else if (tech[i] === "Figma") {
              arr.push(
                  <i key={tech[i]} title="Figma"><i className="fab fa-figma"></i></i>
              )
          }
          else if (tech[i] === "Custom") {
              arr.push(
                  <i key={tech[i]} title="Custom Solution"><i className="fas fa-file-code"></i></i>
              )
          }
          else if (tech[i] === "Netlify") {
              arr.push(
                  <i key={tech[i]} title="Netlify"><i className="fas fa-cloud"></i></i>
              )
          }
          else if (tech[i] === "XD") {
              arr.push(
                  <i key={tech[i]} title="Adobe XD"><i className="fab fa-adobe"></i></i>
              )
          }
          else if (tech[i] === "InDesign") {
              arr.push(
                  <i key={tech[i]} title="Adobe InDesign"><i className="fab fa-adobe"></i></i>
              )
          }
      }
      return (
          arr
      )
  }
}

function picture(imgURL, title) {
  if (imgURL) {
      return (
          <img
              src={imgURL}
              loading="lazy"
              alt={title}
              width="150px"
              height="auto"
          />
      )
  }
}

export default {picture, tech, button}