import React from 'react';
import { getNextStaticProps } from '@faustjs/next';
import { client } from 'client';
import Head from 'next/head';
import { Posts, Header, LoadMore } from 'components';
import usePagination from "../../hooks/usePagination";
import appConfig from "../../app.config";

export default function Page() {
  const { useQuery, usePosts } = client;
  const posts = usePosts({
    first: appConfig.postsPerPage
  });
  const generalSettings = useQuery().generalSettings;
  const {data, fetchMore, isLoading} = usePagination((query, args) => {
    const {
      nodes,
      pageInfo,
    } = query.posts(args);
    return {
      nodes: Array.from(nodes),
      pageInfo
    };
  }, {nodes: posts?.nodes, pageInfo: posts?.pageInfo});

  return (
    <>
      <Head>
        <title>
          All Posts - {generalSettings?.description}
        </title>
      </Head>

      <Header
        title="Latest Posts"
      />

      <main className="container">
        <Posts posts={data?.nodes} readMoreText={"Read More"} id="posts-list"/>
        <LoadMore pageInfo={data.pageInfo} isLoading={isLoading} fetchMore={fetchMore}/>
      </main>
    </>
  );
}

export async function getStaticProps(context) {
  return getNextStaticProps(context, {
    Page,
    client,
  });
}