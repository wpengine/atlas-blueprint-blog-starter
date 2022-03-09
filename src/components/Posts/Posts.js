import React from 'react';
import Link from 'next/link';
import { Heading, FeaturedImage, PostInfo } from 'components';
import styles from './Posts.module.scss';

function Posts({
                 posts,
                 intro,
                 id,
               }) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <section {...(id && { id })}>
      {intro && <p>{intro}</p>}
      <div className="row row-wrap">
        {posts?.map((post) => {
          return (
            <div
              className="column column-33 text-center"
              key={post.id ?? ''}
              id={`post-${post.id}`}>
              <div>
                <FeaturedImage
                  className={styles['post__featured-image']}
                  image={post?.featuredImage?.node}
                  width={340}
                  height={340}
                />
                <Heading level="h4" className={styles['post-header']}>
                  <Link href={`/posts/${post.slug}`}>
                    <a>{post.title()}</a>
                  </Link>
                </Heading>
                <PostInfo
                    className={styles['post-info']}
                    author={post?.author?.node?.name}
                    date={post?.date}
                />
              </div>
            </div>
          );
        })}
        {posts && posts?.length < 1 && <p>No posts found.</p>}
      </div>
    </section>
  );
}

export default Posts;
