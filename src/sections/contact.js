import React from 'react';

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
  
    render() {
      const { name, email, message} = this.state;
      return (
        <form className="contact-form" method="post" name="contact" onSubmit={this.handleSubmit}>
            <input type="hidden" name="form-name" value="contact"/>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="bmd-label-floating" htmlFor="name">Your Name</label>
                        <input id="name" name="name" className="form-control" required value={name} onChange={this.handleChange}/>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="bmd-label-floating" htmlFor="email">Your Email</label>
                        <input id="email" name="email" type="email" className="form-control" required value={email} onChange={this.handleChange}/>
                    </div>
                </div>
            </div>
            <div className="form-group">
                <label htmlFor="subject" className="bmd-label-floating">Your Message</label>
                <textarea id="subject" name="subject" className="form-control" rows="4" required value={message} onChange={this.handleChange}></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="privacyPolicy"><input type="checkbox" id="privacyPolicy" name="privacy" value="privacy" required /> I consent to having this website store my submitted information so they can respond to my inquiry.</label>
            </div>
            <div className="row">
                <div className="col-md-4 ml-auto mr-auto text-center">
                    <input className="btn" value="Send Message" type="submit" />
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
                            <i className="material-icons">phone</i> <a href="tel:+4474777535">07477 7535</a>
                        </div>
                        <div className="col-md-4">
                            <i className="material-icons">email</i> <a href="mailto:joe@joebailey.xyz">joe@joebailey.xyz</a>
                        </div>
                        <div className="col-md-4">
                            <i className="material-icons">my_location</i><p>Southampton, UK</p>
                        </div>
                    </div>
                    <ContactForm></ContactForm>
                </div>
            </div>
        </div>
    )
}

export default Contact;