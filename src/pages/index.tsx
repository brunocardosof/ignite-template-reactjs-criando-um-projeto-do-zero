import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FaRegCalendar } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { next_page, results } = postsPagination;
  return (
    <>
      <Head>
        <title>Desafio 3 - Criando projeto do zero</title>
      </Head>
      <main className={styles.container}>
        {results.map(post => (
          <section className={styles.content} key={post.uid}>
            <p className={styles.postTitle}>{post.data.title}</p>
            <p className={styles.postSubtitle}>{post.data.subtitle}</p>
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
          </section>
        ))}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.content', 'posts.subtitle', 'posts.author'],
      pageSize: 10,
    }
  );
  const posts = response.results.map((post): Post => {
    return {
      uid: post.id,
      first_publication_date: new Date(
        post.first_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        author: post.data.author[0].text,
        subtitle: post.data.subtitle[0].text,
        title: post.data.title[0].text,
      },
    };
  });

  return {
    props: {
      postsPagination: { results: posts, next_page: response.next_page },
    },
  };
};
