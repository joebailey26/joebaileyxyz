import React from 'react';

function Contact() {
    return (
        <div className="section section-contact" id="section-contact">
            <div className="row">
                <div className="col-md-8 ml-auto mr-auto">
                    <h2 className="text-center title">Get in touch</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <i className="material-icons">phone</i> <a href="tel:+4474777535">07477 7535</a>
                        </div>
                        <div className="col-md-4">
                            <i className="material-icons">email</i> <a href="mailto:joe@joebailey.xyz">joe@joebailey.xyz</a>
                        </div>
                        <div className="col-md-4">
                            <i className="material-icons">my_location</i><p>Southampton, UK</p>
                        </div>
                    </div>
                    
                    <form className="contact-form" method="post" name="myemailform" data-netlify="true" data-netlify-recaptcha="true">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="bmd-label-floating" htmlFor="name">Your Name</label>
                                    <input id="name" name="name" className="form-control" required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label className="bmd-label-floating" htmlFor="email">Your Email</label>
                                    <input id="email" name="email" type="email" className="form-control" required />
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="subject" className="bmd-label-floating">Your Message</label>
                            <textarea id="subject" name="subject" className="form-control" rows="4" required></textarea>
                        </div>
                        <div className="form-group">
                            <label htmlFor="privacyPolicy"><input type="checkbox" id="privacyPolicy" name="privacy" value="privacy" required /> I consent to having this website store my submitted information so they can respond to my inquiry.</label>
                        </div>
                        <div data-netlify-recaptcha="true"></div>
                        <div className="row">
                            <div className="col-md-4 ml-auto mr-auto text-center">
                                <button className="btn">
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </form>
                    <div id="form-messages"></div>
                </div>
            </div>
        </div>
    )
}

export default Contact;