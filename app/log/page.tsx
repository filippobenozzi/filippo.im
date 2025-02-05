import type { Metadata } from 'next';
import Link from 'next/link';
import Log from 'content/log.md'
import markdownit from 'markdown-it'

export const metadata: Metadata = {
  title: 'log',
  description: 'Read my thoughts on software development, design, and more.',
};

export default async function LogPage() {

  const md = markdownit({breaks:true,linkify:true})
  const content = md.render(Log);

  return (
    <section>
      <h1 className="font-bold text-2xl mb-8 tracking-tighter">my log</h1>
      <div className="prose prose-neutral mb-8 dark:prose-invert">
        <p>This is my personal log useful also for me, synced with Obsidian, where I share all the insightful pills and interesting resources I discover.</p>
      </div>
      <article className="log prose prose-quoteless prose-neutral dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </section>
  );
}
