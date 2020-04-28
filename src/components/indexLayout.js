import React from "react"

import "../css/main.scss"

import "./css/layout.scss"

import Nav from "./nav"
import Footer from "./footer"
import Sidebar from "./sidebar"

import "../css/featherlight.scss"

if (typeof window !== `undefined`) {
	require('../js/featherlight')
}

const Layout = ({ children, header }) => {
  return (
    <div>
      <Nav></Nav>
      <main className="main">
        <div className="container ml-auto mr-auto">
            <section className="section has-sidebar">
                <div className="row">
                  {header}
                </div>
                <div className="row">
                    <div className="col-md-8 ml-auto mr-auto">
                        {children}
                    </div>
                    <div className="col-md-4 ml-auto mr-auto">
                      <Sidebar></Sidebar>
                    </div>
                </div>
            </section>
        </div>
      </main>
      <Footer></Footer>
    </div>
  )
}

export default Layout
