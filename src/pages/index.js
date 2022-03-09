import { getNextStaticProps } from '@faustjs/next';
import Head from 'next/head';
import React from 'react';
import { client } from 'client';
import { Posts, Pagination, Heading, Header } from 'components';
import appConfig from 'app.config';

export default function Page() {
  const {useQuery, usePosts} = client;
  const generalSettings = useQuery().generalSettings;
  const posts = usePosts({
    first: appConfig.postsPerPage,
    where: {
      categoryName: 'uncategorized',
    },
  });

  return (
    <>
      <Head>
        <title>
          {generalSettings?.title} - {generalSettings?.description}
        </title>
      </Head>
      <Header
        title="Home Page"
      />
      <main className="container">
        <Posts posts={posts?.nodes} readMoreText={"Read More"} id="posts-list"/>
        <Pagination pageInfo={posts?.pageInfo} basePath="posts"/>
      </main>
    </>
  )
}

export async function getStaticProps(context) {
  return getNextStaticProps(context, {
    Page,
    client,
  });
}