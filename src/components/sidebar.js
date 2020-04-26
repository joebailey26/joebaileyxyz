import React from 'react';
import { Link } from "gatsby"

import './css/sidebar.scss';

function Sidebar() {
  return (
    <div className="sidebar">
        <ul>
          <li><Link to="blog">Blog</Link></li>
          <li>
            Portfolio
            <ul>
              <li><Link to="portfolio/websites">Websites</Link></li>
              <li><Link to="portfolio/website-templates">Website Templates</Link></li>
              <li><Link to="portfolio/projects">Projects</Link></li>
            </ul>
          </li>
        </ul>
    </div>
  )
}

export default Sidebar;