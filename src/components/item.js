/* 
    Item Component for Portfolio 
    Props:
        title
        desc
        websiteLink
        docsLink
        behanceLink
    Requires Button Component
*/

import React from 'react';
import Button from './button';

function image(imag) {
    let image = imag.replace(/\s/g, '');
    return image
}

function button(link, text) {
    if (link) {
        return (
            <Button link={link} text={text}></Button>
        )
    }
}

function picture(title, picture) {
    if (!picture) {
        return (
            <picture>
                <source
                    srcSet={`img/Portfolio/${image(title)}.webp`}
                    type="image/webp"
                />
                <source
                    srcSet={`img/Portfolio/${image(title)}.jpg`}
                    type="image/jpg"
                />
                <img
                    src={`img/Portfolio/${image(title)}.jpg`}
                    loading="lazy"
                    alt={title}
                    width="150px"
                    height="auto"
                />
            </picture>
        )
    }
}

function tech(tech) {
    let arr = [];
    for (var i = 0; i < tech.length; i++) {
        if (tech[i] === "google") {
            arr.push(
                <a key={tech[i]} title="Firebase"><i className={"fab fa-" + tech[i]}></i></a>
            )
        }
        else if (tech[i] === "file-code") {
            arr.push(
                <a key={tech[i]} title="Custom Solution"><i className={"fas fa-" + tech[i]}></i></a>
            )
        }
        else if (tech[i] === "cloud") {
            arr.push(
                <a key={tech[i]} title="Netlify"><i className={"fas fa-" + tech[i]}></i></a>
            )
        }
        else if (tech[i] === "adobe-xd") {
            arr.push(
                <a key={tech[i]} title="Adobe XD"><i className="fab fa-adobe"></i></a>
            )
        }
        else if (tech[i] === "adobe") {
            arr.push(
                <a key={tech[i]} title="Adobe InDesign"><i className={"fab fa-" + tech[i]}></i></a>
            )
        }
        else {
            arr.push(
                <a key={tech[i]} title={tech[i]}><i className={"fab fa-" + tech[i]}></i></a>
            )
        }
    }
    return (
        arr
    )
}

function Item(props) {
        return (
            <article className="col-md-4">
                <h4 className="info-title">{props.title}</h4>
                {picture(props.title, props.picture)}
                <div className="tech-stack">{tech(props.tech)}</div>
                <p>{props.desc}</p>
                {button(props.websiteLink, "View the website")}
                {button(props.docsLink, "Read the docs")}
                {button(props.behanceLink, "View on Behance")}
                {button(props.projectLink, "View the project")}
                {button(props.gitHubLink, "View on GitHub")}
            </article>
        )
}

export default Item;
  