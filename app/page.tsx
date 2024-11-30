import { Suspense } from 'react';
import { allBlogs } from 'contentlayer/generated';
import Link from 'next/link';

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  );
}

function OpenSourceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width="22"
      height="22"
    >
      <path
        d="M 16 4 C 9.382813 4 4 9.382813 4 16 C 4 21.125 7.214844 25.503906 11.75 27.21875 L 12.6875 27.59375 L 13.0625 26.65625 L 15.53125 20.09375 L 15.875 19.15625 L 14.9375 18.8125 C 13.804688 18.382813 13 17.292969 13 16 C 13 14.332031 14.332031 13 16 13 C 17.667969 13 19 14.332031 19 16 C 19 17.292969 18.195313 18.382813 17.0625 18.8125 L 16.125 19.15625 L 16.46875 20.09375 L 18.9375 26.65625 L 19.3125 27.59375 L 20.25 27.21875 C 24.785156 25.503906 28 21.125 28 16 C 28 9.382813 22.617188 4 16 4 Z M 16 6 C 21.535156 6 26 10.464844 26 16 C 26 19.921875 23.683594 23.203125 20.40625 24.84375 L 18.59375 20.0625 C 19.976563 19.171875 21 17.757813 21 16 C 21 13.25 18.75 11 16 11 C 13.25 11 11 13.25 11 16 C 11 17.757813 12.023438 19.171875 13.40625 20.0625 L 11.59375 24.84375 C 8.316406 23.203125 6 19.921875 6 16 C 6 10.464844 10.464844 6 16 6 Z"
        fill="#81C784"
      />
    </svg>
  );
}

function formatDate(date: string) {
  const currentDate = new Date();
  const targetDate = new Date(date);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = '';

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = 'Today';
  }

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `${fullDate}`;
}

async function ProjectLink({ link, name, desc, opensource = false }) {
  
  return (
    <a href={`${link}`} target='_blank' className="flex items-center flex-wrap">
      <div className="flex flex-col">
        <p className="underline hover:text-neutral-600 dark:hover:text-neutral-100 mr-2 transition-all">
          {name}
        </p>
      </div>
      { opensource && (
        <OpenSourceIcon />
      )}
      <div className="prose prose-neutral text-neutral-400 text-sm dark:text-neutral-400 dark:prose-invert mt-1">{desc}</div>
    </a>
  );
}

async function ProjectList({ link, name, opensource = false }) {
  
  return (
    <a href={`${link}`} target='_blank' className="inline-flex hover:text-neutral-600 dark:hover:text-neutral-100 transition-all" rel="noopener noreferrer">
      <p className="underline">
        {name}
      </p>
      { opensource && (
        <OpenSourceIcon />
      )}
    </a>
  );
}

export default async function Page() {

  return (
    <section>
      <h1 className="font-bold text-2xl mb-8 tracking-tighter">
        hey, I'm Filippo 👋
      </h1>
      <p className="prose prose-neutral dark:prose-invert">
        I'm Filippo Benozzi, a developer and economic student with a deep passion for technology and innovation. I hold a bachelor's degree in Computer Science and am currently pursuing a Master's in <a target='_blank' href='https://www.unive.it/pag/24754/'>Global Development and Entrepreneurship</a> at the University of Venice.
      </p>
      
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          For eight years, I worked as a web application developer in a web agency, where I honed my skills in creating and optimizing digital solutions.<br />
          Now, I'm the administrator of <a target='_blank' href='https://errebi.it'>ErreBi Maglieria</a>, a family-owned fashion business and together with my sister, I launched <a target='_blank' href='https://coutique.com'>Coutique</a>, a premium brand that produces high-end clothing made with sustainable and natural fibers.<br />
          My passion for technology remains strong, driving my mission to digitize our entire company using open-source software. Through this process, I aim to bring the open-source ethos into leadership and management, fostering a culture of transparency and collaboration.
        </p>
      </div>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          In my free time, I enjoy staying active with running, cycling, swimming.<br />
          This space is where I share my journey—be it about technology, entrepreneurship, or personal growth. I hope it inspires and informs others as they navigate their own paths.
        </p>
      </div>

      <ul className="flex flex-col md:flex-row mt-4 space-x-0 md:space-x-4 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <Link
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            href="thoughts"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">my thoughts</p>
          </Link>
        </li>
        <li>
          <Link
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            target="_blank"
            href="https://cv.filippo.im/"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">my cv</p>
          </Link>
        </li>
      </ul>
      
      <div className="my-8 flex flex-col space-y-4 w-full">
        <h2 className="font-bold text-xl mb-2 mt-4 tracking-tighter">recently</h2>
        <Suspense>
          {allBlogs
            .sort((a, b) => {
              if (new Date(a.publishedAt) > new Date(b.publishedAt)) {
                return -1;
              }
              return 1;
            })
            .slice(0,2)
            .map((post) => (
              <Link
                key={post.slug}
                className="flex flex-col space-y-1 mb-4"
                href={`/blog/${post.slug}`}
              >
                <div className="w-full flex flex-col">
                  <p className="text-neutral-900 font-semibold dark:text-neutral-100 tracking-tight">
                    {post.title}
                  </p>
                  <p className="text-neutral-400 text-sm dark:text-neutral-400">
                    {formatDate(post.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
        </Suspense>
      </div>
      <div className="my-8 flex flex-col space-y-4 w-full">
        <h2 className="font-bold text-xl mb-2 mt-4 tracking-tighter">my work</h2>
        <Suspense>
          
          <ProjectLink 
            link={'https://wordpress.org/plugins/popup-notifier-for-contact-form-7'}
            name={'Popup Message Notifier for CF7'}
            desc={'Simple Wordpress plugin that show confirmation and error messages for CF7.'}
            opensource={true}
          />
          <ProjectLink 
            link={'https://github.com/filippobenozzi/acf-boilerplate'}
            name={'ACF Boilerplate'}
            desc={"Starter for Wordpress with ACF. It's also already set-up for using and compiling SASS and ES6."}
            opensource={true}
          />
          <ProjectLink 
            link={'https://progettoesordio.com'}
            name={'Progetto Esordio'}
            desc={"Open community that help people affcted by diabetes with professionals and digital materials."}
          />
          <ProjectLink 
            link={'https://www.edventurousleadership.com'}
            name={'Edventurous Leadership'}
            desc={"LMS that challenges different types of leaders to think more broadly about leadership."}
          />
          <h3 className="font-bold text-base mt-4 tracking-tighter">other projects</h3>
          <div className="flex flex-wrap w-full project-list text-sm">
            <ProjectList name={'Oikos'} link={'https://oikos.it/'} />
            <ProjectList name={'Atlantis Caps'} link={'https://atlantisheadwear.com/'} />
            <ProjectList name={'Dinamiza'} link={'https://dinamiza.it/'} />
            <ProjectList name={'Segnobit'} link={'https://segnobit.com/'} />
            <ProjectList name={'Frappa Edilizia'} link={'https://frappa.it/'} />
            <ProjectList name={'Vega Carburanti'} link={'https://www.vegacarburanti.it/'} />
            <ProjectList name={'Booking System'} link={'https://booking.alwaysgrowing.co.uk/'} />
          </div>
        </Suspense>
      </div>
      <ul className="flex flex-col md:flex-row mt-12 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <Link
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="mailto:email@filippo.im"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">email me</p>
          </Link>
        </li>
        <li>
          <Link
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/filippobenozzi/"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">linkedin</p>
          </Link>
        </li>
        <li>
          <Link
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer me"
            target="_blank"
            href="https://mastodon.social/@iamfil"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">mastodon</p>
          </Link>
        </li>
        <li>
          <Link
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.strava.com/athletes/10859683"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">strava</p>
          </Link>
        </li>
      </ul>
    </section>
  );
}
