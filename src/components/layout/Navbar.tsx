import React from "react"
import { Link } from "gatsby"
import { FaBars } from "react-icons/fa"

import "./Navbar.css";

/// Navigation links for the site
const links = [
    {
      text: "Home",
      url: "/",
      description:
        "Back to the home page",
    },
    {
        text: "About",
        url: "/about",
        description:
          "Learn about us",
    },
    {
        text: "Latest",
        url: "/latest",
        description:
          "Read our latest issue",
    },
    {
        text: "Catalog",
        url: "/catalog",
        description:
          "Browse our catalog",
    },
    {
        text: "Merch",
        url: "/merch",
        description:
          "Browse our merch store",
    },
    {
        text: "Featured",
        url: "/featured",
        description:
          "See our featured artists",
    },
    {
        text: "Subscribe",
        url: "/subscribe",
        description:
          "Subscribe to our magazine",
    },
    {
        text: "Contact",
        url: "/contact",
        description:
          "Get in touch",
    }
  ]
 
/// Navbar component that displays the navigation links
const Navbar: React.FC = () => {
    let [responsive, setResponsive] = React.useState(false);

    return (
        <nav className={responsive ? "navbar responsive" : "navbar"} aria-label="Main Navigation">
            <button 
            className="icon" 
            onClick={() => setResponsive(!responsive)} 
            aria-expanded={responsive} 
            aria-controls="navbarMenu"
            aria-label="Toggle navigation menu"
            >
            <FaBars />
            </button>
            <ul id="navbarMenu" className="navbarMenu">
            {links.map(link => (
                <li key={link.url} className="navbarMenuItem">
                <Link to={link.url} aria-label={link.description}>{link.text}</Link>
                </li>
            ))}
            </ul>
        </nav>
    )
}

export default Navbar