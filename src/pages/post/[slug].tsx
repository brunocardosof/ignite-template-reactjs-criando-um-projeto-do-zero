import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { FaRegCalendar } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <div className={styles.container}>
      <img src={post.data.banner.url} alt="banner" />
      <p className={styles.postTitle}>{post.data.title}</p>
      <div className={styles.wrapperTimeAuthor}>
        <time>
          <FaRegCalendar className={styles.icon} />
          {post.first_publication_date}
        </time>
        <span className={styles.author}>
          <FiUser className={styles.icon} />
          {post.data.author}
        </span>
      </div>
      <div>
        <h1>{post.data.content[0].heading}</h1>
        {post.data.content[0].body.map(item => (
          <h1>{item.text}</h1>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.slug'],
      pageSize: 1,
    }
  );
  const paths = posts.results.map(result => ({
    params: { slug: result.uid },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
    },
  };
  return {
    props: { post },
    revalidate: 60 * 60, // 1 hora
  };
};
