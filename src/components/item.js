/* 
    Item Component for Portfolio 
    Props:
        title
        imgURL
        desc
        Link
        websiteLink
        projectLink
        docsLink
        behanceLink
    Requires Button Component
*/

import React from 'react';
import Button from './button';

function button(link, text) {
    if (link) {
        return (
            <Button link={link} text={text}></Button>
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

function Item(props) {
        return (
            <article className="col-md-4">
                <a href={props.websiteLink || props.projectLink || props.Link}>
                    <h4 className="info-title" 
                    dangerouslySetInnerHTML={{
                      __html: props.title,
                    }}>
                    </h4>
                </a>
                {picture(props.imgURL, props.title)}
                <div className="tech-stack">{tech(props.tech)}</div>
                <p dangerouslySetInnerHTML={{
                      __html: props.desc,
                }}></p>
                <div className="buttonsContainer">
                    {button(props.websiteLink, "View the website")}
                    {button(props.docsLink, "Read the Docs") || button(props.Link, "Continue Reading")}
                    {button(props.behanceLink, "View on Behance")}
                    {button(props.projectLink, "View the project")}
                    {button(props.gitHubLink, "View on GitHub")}
                </div>
            </article>
        )
}

export default Item;
  