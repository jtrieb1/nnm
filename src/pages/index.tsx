import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

import Hero from "../components/hero/Hero"
import NewsContainer from "../components/news/NewsContainer"
import Header from "../components/layout/Header"
import Footer from "../components/layout/Footer"

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
