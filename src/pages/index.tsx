/* eslint-disable jsx-a11y/no-static-element-interactions */
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { RichText } from 'prismic-dom';
import { FaRegCalendar } from 'react-icons/fa';
import { FiUser } from 'react-icons/fi';

import { useState } from 'react';
import Link from 'next/link';
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
  const [posts, setPosts] = useState<Post[]>(results || []);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(next_page);

  async function handleNextPage(): Promise<void> {
    setLoading(true);
    await fetch(nextPage)
      .then(async response => {
        const result = await response.json();
        const getPostResult = result.results.map(post => {
          return {
            uid: post.id,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              author: post.data.author[0].text,
              subtitle: post.data.subtitle[0].text,
              title: post.data.title[0].text,
            },
          };
        });
        console.log(getPostResult);
        setPosts([...posts, ...getPostResult]);
        setNextPage(result.next_page);
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.log(error);
      });
  }

  return (
    <>
      <Head>
        <title>Desafio 3 - Criando projeto do zero</title>
      </Head>
      <main className={styles.container}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`}>
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
          </Link>
        ))}
        {nextPage && (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events
          <span className={styles.loader} onClick={handleNextPage}>
            {loading ? 'Carregando...' : 'Carregar mais posts'}
          </span>
        )}
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
      pageSize: 1,
    }
  );
  const posts = response.results.map((post): Post => {
    return {
      uid: post.id,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
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
