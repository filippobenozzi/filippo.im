'use client';

import clsx from 'clsx';
import md from 'markdown-it'
import useSWR from 'swr'

interface GistProps {
  id: string;
  filename: string;
}

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Gist({ id, filename }: GistProps) {

  const { data, error } = useSWR(`https://api.github.com/gists/${id}`, fetcher)

  const response: string = data?.['files'][filename]['content'] ? data?.['files'][filename]['content'] : '';

  const text: string = response ? response.replace(/---\ngists:[^>]+true\n---/g,'') : '';

  return (
    <div className="prose log prose-neutral mb-8 dark:prose-invert" dangerouslySetInnerHTML={{ __html: md({breaks: true, linkify: true}).render(text) }}></div>
  );
}
