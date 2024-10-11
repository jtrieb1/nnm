import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

import Hero from "../components/hero/Hero"
import NewsContainer from "../components/news/NewsContainer"
import Layout from "../components/layout/Layout"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <Layout clipbg>
      <Hero
        title="no nothing magazine"
        description="The magazine about nothing, but in a legally distinct way."
      />
      <NewsContainer />
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>no nothing magazine | home</title>
