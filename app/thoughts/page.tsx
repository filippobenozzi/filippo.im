import type { Metadata } from 'next'
import Gist from '../components/gist';

export const metadata: Metadata = {
  title: 'my thoughts',
  description: 'My philosophical quotes and thoughts about life.',
};

export default async function ThoughtsPage() {

  return (
    <section>
      <h1 className="font-bold text-2xl mb-8 tracking-tighter">my thoughts</h1>
      <div className="prose prose-neutral mb-8 dark:prose-invert">
      </div>
      <Gist id={'6885889eb37fba9ffc5c0cf7d4cb3e5b'} filename={'thoughts.md'} />
    </section>
  );
  
}
