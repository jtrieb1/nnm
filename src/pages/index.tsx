import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

import Hero from "../components/hero"
import Layout from "../components/layout"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <Layout>
      <Hero
        imageUrl="https://images.unsplash.com/photo-1484308129484-ff3063eea281?q=80&w=1924&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        title="no nothing magazine"
        description="The magazine about nothing, but in a legally distinct way."
      />
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>no nothing magazine</title>
