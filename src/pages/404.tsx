import * as React from "react"
import { Link, HeadFC, PageProps } from "gatsby"

import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <>
      <Header />
      <h1 tabIndex={-1}>Page not found</h1>
      <p>
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <p>
        <Link to="/">Go back to the homepage</Link>
      </p>
      <Footer />
    </>
  )
}

export default NotFoundPage

export const Head: HeadFC = () => <title>Not found</title>
