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
  return (
    <>
      <Head>
        <title>Desafio 3 - Criando projeto do zero</title>
      </Head>
      <main className={styles.container}>
        <section className={styles.content}>
          <p className={styles.postTitle}>Como utilizar Hooks</p>
          <p className={styles.postSubtitle}>
            Pensando em sincronização em vez de ciclos de vida
          </p>
          <div className={styles.wrapperTimeAuthor}>
            <time>
              <FaRegCalendar className={styles.icon} />
              15 de Mar 2021
            </time>
            <span className={styles.author}>
              <FiUser className={styles.icon} />
              Joseph Oliveira
            </span>
          </div>
        </section>
        <section className={styles.content}>
          <p className={styles.postTitle}>Como utilizar Hooks</p>
          <p>Pensando em sincronização em vez de ciclos de vida</p>
          <div className={styles.wrapperTimeAuthor}>
            <time>
              <FaRegCalendar className={styles.icon} />
              15 de Mar 2021
            </time>
            <span className={styles.author}>
              <FiUser className={styles.icon} />
              Joseph Oliveira
            </span>
          </div>
        </section>
        <section className={styles.content}>
          <p className={styles.postTitle}>Como utilizar Hooks</p>
          <p>Pensando em sincronização em vez de ciclos de vida</p>
          <div className={styles.wrapperTimeAuthor}>
            <time>
              <FaRegCalendar className={styles.icon} />
              15 de Mar 2021
            </time>
            <span className={styles.author}>
              <FiUser className={styles.icon} />
              Joseph Oliveira
            </span>
          </div>
        </section>
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

  const posts = response.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title[0].text,
      subtitle: post.data.subtitle[0].text,
      author: post.data.author,
      updatedAt: new Date(post.last_publication_date).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      ),
    };
  });

  return {
    props: {
      postsPagination: { result: posts, next_page: response.next_page },
    },
  };
};
