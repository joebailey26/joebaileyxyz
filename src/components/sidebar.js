import React from 'react';
import { Link } from "gatsby"

import './css/sidebar.scss';

function Sidebar() {
  return (
    <div className="sidebar">
        <ul>
          <li><Link to="blog">Blog</Link></li>
          <li><Link to="portfolio">Portfolio</Link></li>
          <li><Link to="projects">Projects</Link></li>
          <li>
            <details>
              <summary>
                Archive
              </summary>
              <ul>
                <li><Link to="archive/websites">Websites</Link></li>
                <li><Link to="archive/website-templates">Website Templates</Link></li>
                <li><Link to="archive/graphic-design">Graphic Design</Link></li>
                <li>
                  <details>
                    <summary>
                      Long Road Sixth Form College
                    </summary>
                    <ul>
                      <li><Link to="long-road/unit-24">Unit 24 - Careers</Link></li>
                      <li><Link to="long-road/unit-32">Unit 32 - Advertising</Link></li>
                      <li><Link to="long-road/unit-34">Unit 34 - Web Design</Link></li>
                      <li><Link to="long-road/unit-35">Unit 35 - Graphic Design</Link></li>
                      <li><Link to="long-road/unit-61">Unit 61 - Animation Planning</Link></li>
                      <li><Link to="long-road/unit-66">Unit 66 - Animation Production</Link></li>
                    </ul>
                  </details>
                </li>
              </ul>
            </details>
          </li>
        </ul>
    </div>
  )
}

export default Sidebar;