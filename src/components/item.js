/* 
    Item Component for Portfolio 
    Props:
        title
        imgURL
        desc
        Link
        websiteLink
        projectLink
        behanceLink
        docsLink
    Requires Individual Item Component
*/

import React from 'react'
import {Link} from 'gatsby'

import {picture, tech, button} from "./individualItem"

function links(link, title) {
    if (link) {
        return (
            <Link to={link}>
                <h4 className="info-title" 
                dangerouslySetInnerHTML={{
                    __html: title,
                }}>
                </h4>
            </Link>
        )
    }
    else {
        return (
            <h4 className="info-title" 
                dangerouslySetInnerHTML={{
                    __html: title,
                }}>
            </h4>
        )
    }
}

function continueReading(link) {
    if (link) {
        return <Link to={link} className="btn">Continue Reading</Link>
    }
}
function docsLink(link) {
    if (link) {
        return <Link to={link} className="btn">Read the docs</Link>
    }
}

function Item(props) {
    return (
        <article className="col-md-4">
            {links(props.Link, props.title)}
            {picture(props.imgURL, props.title)}
            <div className="tech-stack">{tech(props.tech)}</div>
            <div dangerouslySetInnerHTML={{__html: props.desc}}></div>
            <div className="buttonsContainer">
                {button(props.websiteLink, "View the website")}
                {continueReading(props.Link)}
                {docsLink(props.docsLink)}
                {button(props.behanceLink, "View on Behance")}
                {button(props.projectLink, "View the project")}
                {button(props.gitHubLink, "View on GitHub")}
            </div>
        </article>
    )
}

export default Item;
  