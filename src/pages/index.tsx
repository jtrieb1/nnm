import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

import Hero from "../components/hero"
import NewsContainer from "../components/news"
import Header from "../components/header"
import Footer from "../components/footer"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <>
      <Header />
      <Hero
        title="no nothing magazine"
        description="The magazine about nothing, but in a legally distinct way."
      />
      <NewsContainer />
      <Footer />
    </>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>no nothing magazine | home</title>
