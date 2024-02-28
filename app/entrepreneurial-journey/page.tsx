import type { Metadata } from 'next'
import Gist from '../components/gist';

export const metadata: Metadata = {
  title: 'my entrepreneurial journey',
  description: 'My journey through entrepreneurship.',
};

export default async function EntrepreneuralJourneyPage() {

  return (
    <section>
      <h1 className="font-bold text-2xl mb-8 tracking-tighter">my entrepreneurial journey</h1>
      <div className="prose prose-neutral mb-8 dark:prose-invert">
      </div>
      <Gist id={'0b5ddf35e6d70d118c86f10c3d7801bf'} filename={'entrepreneurial-journey.md'} />
    </section>
  );
  
}
