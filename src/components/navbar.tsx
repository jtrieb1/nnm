import React from "react"
import { Link } from "gatsby"

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
    /* // Taken out until ready
    {
        text: "Merch",
        url: "/merch",
        description:
          "Browse our merch store",
    },
    */
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
 
const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <ul className="navbarMenu">
                {links.map(link => (
                    <li key={link.url} className="navbarMenuItem">
                        <Link to={link.url}>{link.text}</Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default Navbar