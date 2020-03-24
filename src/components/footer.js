/*  
    Footer component 
    Included on all pages
    Requires Font Awesome Brands
*/
import React from 'react';

import './css/footer.scss';

function Footer() {
  return (
    <footer className="footer text-center">
        <div className="container ml-auto mr-auto">
            <div className="row">
                <div className="col-md-8 ml-auto mr-auto">
                    <div className="copyright">
                        &copy; <time>{new Date().getFullYear()}</time> Joe Bailey. All rights reserved.
                    </div>
                    <div className="social">
                        <a title="Twitter" aria-label="Twitter Social Profile Link" href="https://twitter.com/JoeBailey26" rel="noopener noreferrer" target="_blank">
                            <i className="fab fa-twitter"></i>
                        </a>
                        <a title="LinkedIn" aria-label="LinkedIn Social Profile Link" href="https://www.linkedin.com/in/joe-bailey-b68b17171/" rel="noopener noreferrer" target="_blank">
                            <i className="fab fa-linkedin"></i>
                        </a>
                        <a title="Behance" aria-label="Behance Social Profile Link" href="https://www.behance.net/joebailey26" rel="noopener noreferrer" target="_blank">
                            <i className="fab fa-behance-square"></i>
                        </a>
                        <a title="GitHub" aria-label="GitHub Social Profile Link" href="https://github.com/joebailey26" rel="noopener noreferrer" target="_blank">
                            <i className="fab fa-github"></i>
                        </a>
                        <a title="CodePen" aria-label="CodePen Social Profile Link" href="https://codepen.io/joebailey26" rel="noopener noreferrer" target="_blank">
                            <i className="fab fa-codepen"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>   
    </footer>
  );
}

export default Footer;
