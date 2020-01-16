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

function Item(props) {
        return (
            <article className="col-md-4">
                <picture>
                    <source
                        srcSet={`img/Portfolio/${image(props.title)}.webp`}
                        type="image/webp"
                    />
                    <source
                        srcSet={`img/Portfolio/${image(props.title)}.jpg`}
                        type="image/jpg"
                    />
                    <img
                        src={`img/Portfolio/${image(props.title)}.jpg`}
                        loading="lazy"
                        alt={props.title}
                        width="150px"
                        height="auto"
                    />
            </picture>
                <h4 className="info-title">{props.title}</h4>
                <p>{props.desc}</p>
                {button(props.websiteLink, "View the website")}
                {button(props.docsLink, "Read the docs")}
                {button(props.behanceLink, "View on Behance")}
            </article>
        )
}

export default Item;
  