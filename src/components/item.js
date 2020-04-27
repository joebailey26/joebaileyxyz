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
    Requires Individual Item Component
*/

import React from 'react'
import {Link} from 'gatsby'

import {picture, tech, button} from "./individualItem"

function links(link, title) {
    if (link) {
        return (
            <Link to={Link}>
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

function Item(props) {
    return (
        <article className="col-md-4">
            {links(props.Link, props.title)}
            {picture(props.imgURL, props.title)}
            <div className="tech-stack">{tech(props.tech)}</div>
            <div dangerouslySetInnerHTML={{__html: props.desc}}></div>
            <div className="buttonsContainer">
                {button(props.websiteLink, "View the website")}
                {button(props.Link, "Continue Reading")}
                {button(props.behanceLink, "View on Behance")}
                {button(props.projectLink, "View the project")}
                {button(props.gitHubLink, "View on GitHub")}
            </div>
        </article>
    )
}

export default Item;
  