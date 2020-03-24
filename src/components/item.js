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
            if (tech[i] === "google") {
                arr.push(
                    <i key={tech[i]} title="Firebase"><i className={"fab fa-" + tech[i]}></i></i>
                )
            }
            else if (tech[i] === "file-code") {
                arr.push(
                    <i key={tech[i]} title="Custom Solution"><i className={"fas fa-" + tech[i]}></i></i>
                )
            }
            else if (tech[i] === "cloud") {
                arr.push(
                    <i key={tech[i]} title="Netlify"><i className={"fas fa-" + tech[i]}></i></i>
                )
            }
            else if (tech[i] === "adobe-xd") {
                arr.push(
                    <i key={tech[i]} title="Adobe XD"><i className="fab fa-adobe"></i></i>
                )
            }
            else if (tech[i] === "adobe") {
                arr.push(
                    <i key={tech[i]} title="Adobe InDesign"><i className={"fab fa-" + tech[i]}></i></i>
                )
            }
            else {
                arr.push(
                    <i key={tech[i]} title={tech[i]}><i className={"fab fa-" + tech[i]}></i></i>
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
  