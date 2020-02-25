/*  
    Contact Section
    Creates Netlify Compatible Form and handles logic for sending submission via Ajax
*/
import React from 'react';

import './css/contact.scss';

const encode = (data) => {
    return Object.keys(data)
        .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
        .join("&");
}

class ContactForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = { name: "", email: "", message: ""};
    }
  
    /* Here’s the juicy bit for posting the form submission */
    handleSubmit = e => {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({ "form-name": "contact", ...this.state })
      })
        .then(() => alert("Message sent successfully! We'll be in touch within 2-3 working days"))
        .catch(error => alert(error));
  
      e.preventDefault();
    };
  
    handleChange = e => this.setState({ [e.target.name]: e.target.value });

    checkform() {
        if (document.readyState === "complete" || document.readyState === "loaded") {
            var cansubmit = true;
            
            if (document.querySelector("#name").value.length === 0) cansubmit = false;
            if (document.querySelector("#email").value.length === 0) cansubmit = false;
            if (document.querySelector("#message").value.length === 0) cansubmit = false;
            if (document.querySelector("#privacyPolicy").checked === false) cansubmit = false;
        
            document.querySelector('input[type="submit"]#formSubmit').disabled = !cansubmit;
        }
    }
  
    render() {
      const { name, email, message} = this.state;
      return (
        <form className="contact-form" method="post" name="contact" onSubmit={this.handleSubmit}>
            <input type="hidden" name="form-name" value="contact"/>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="bmd-label-floating" htmlFor="name">Your Name</label>
                        <input id="name" name="name" className="form-control" required value={name} onChange={this.handleChange} onKeyUp={this.checkform}/>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="bmd-label-floating" htmlFor="email">Your Email</label>
                        <input id="email" name="email" type="email" className="form-control" required value={email} onChange={this.handleChange} onKeyUp={this.checkform}/>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="message" className="bmd-label-floating">Your Message</label>
                <textarea id="message" name="message" className="form-control" rows="4" required value={message} onChange={this.handleChange} onKeyUp={this.checkform}></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="privacyPolicy"><input type="checkbox" id="privacyPolicy" name="privacy" value="privacy" required onChange={this.checkform}/> I consent to having this website store my submitted information so they can respond to my inquiry.</label>
            </div>
            <div className="row">
                <div className="col-md-4 ml-auto mr-auto text-center">
                    <input className="btn" value="Send Message" type="submit" id="formSubmit" disabled/>
                </div>
            </div>
        </form>
      );
    }
  }

function Contact() {
    return (
        <div className="section section-contact" id="section-contact">
            <div className="row">
                <div className="col-md-8 ml-auto mr-auto">
                    <h2 className="text-center title">Get in touch</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <a href="tel:+4474777535">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                                </svg>
                                07477 7535
                            </a>
                        </div>
                        <div className="col-md-4">
                            <a href="mailto:joe@joebailey.xyz">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                </svg>
                                joe@joebailey.xyz
                            </a>
                        </div>
                        <div className="col-md-4">
                            <p>
                                <address>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                                    </svg>
                                    Southampton, UK
                                </address>
                            </p>
                        </div>
                    </div>
                    <ContactForm></ContactForm>
                </div>
            </div>
        </div>
    )
}

export default Contact;