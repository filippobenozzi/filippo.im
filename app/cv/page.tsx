import type { Metadata } from 'next'
import { Suspense } from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'my cv',
  description: 'My philosophical quotes and thoughts about life.',
};

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

export default async function CVPage() {

  return (
    <section>
      <h1 className="font-bold text-2xl mb-8 tracking-tighter">my cv</h1>
      <div className="prose prose-neutral mb-8 dark:prose-invert">
        <p>I am Filippo Benozzi, a professional with an academic and professional background that bridges computer science, entrepreneurship, and management.<br />
          After completing my studies in Computer Science at the University of Trento, I pursued a degree in Global Development and Entrepreneurship at the University of Venice to further expand my expertise.</p>
        <p>I worked for 7 years at a web agency in Mestre, where I honed and expanded the technical skills I developed during my university studies. As a Front-End Developer, I consistently kept myself updated by experimenting with new frameworks (especially about CSS and JavaScript) and attending industry conferences.<br />
        This experience strengthened my innovative approach and commitment to lifelong learning in a rapidly evolving field.</p>
        <p>Currently, I am the administrator of ErreBi SAS, my family’s company specializing in the production and retail of knitwear. In addition, together with my sister, I co-founded Coutique, a brand that merges tradition with sustainability, producing knitwear made from natural and/or sustainable fibers.</p>
        <p>With this new venture, I aim to combine my expertise in computer science with my experience in economics, integrating the principles of open-source into management. This innovative approach not only enhances business processes through digitalization but also fosters an inclusive and collaborative leadership style.</p>
        <p>As part of my commitment to innovation, I developed a purchase and sales analysis system that incorporates external factors impacting the company. I have also coordinated events such as fashion shows and photo shoots, managing their digital marketing strategies.</p>
        <p>Each experience represents an opportunity for me to grow and make a meaningful contribution to building innovative and sustainable ventures.</p>
        <h2 className="font-bold text-xl tracking-tighter">Work experience</h2>
        <h3 className='mb-0 mt-6'>
          <a className="font-bold text-base tracking-tighter m-0" target='_blank' href='https://nehos.it'>ErreBi Maglieria</a>
        </h3>
        <p className="text-neutral-400 text-sm dark:text-neutral-400">Administrator // 2013 - present</p>
        <p className='mt-0'>As the Administrator of ErreBi SAS, a family business specializing in the design, production, and marketing of knitwear products, I oversee various strategic and operational aspects. I manage digital marketing campaigns and lead the planning and execution of events such as fashion shows and photo shoots. Additionally, I have developed a custom analysis tool that integrates internal and external data to programmatically evaluate and enhance the company’s purchasing and sales performance.</p>
        <p>Furthermore, I am the co-founder of Coutique, a brand born from the vision of combining tradition and sustainability, producing knitwear crafted with natural and sustainable yarns. This role allows me to merge my expertise in technology and management, bringing innovative and sustainable practices to the forefront of the business.</p>
        <h3 className='mb-0 mt-6'>
          <a className="font-bold text-base tracking-tighter m-0" target='_blank' href='https://nehos.it'>Dinamiza by Nehos</a>
        </h3>
        <p className="text-neutral-400 text-sm dark:text-neutral-400">Web Application Developer // 2017 - 2024</p>
        <p className='mt-0'>I worked as a Front-End Developer specializing in the development of static and dynamic websites and web applications. I created custom themes and maintained websites using popular CMS platforms such as WordPress, Drupal, and Prestashop. In addition to delivering reliable and high-quality solutions, I took the opportunity, particularly on creative projects, to experiment with innovative CSS and JavaScript frameworks like React, Tailwind, GatsbyJS, NextJS, and Symfony, continuously expanding my skill set and staying ahead in a rapidly evolving industry.</p>
        <h2 className="font-bold text-xl tracking-tighter">Education</h2>
        <h3 className='mb-0 mt-6'>
          <a className="font-bold text-base tracking-tighter m-0" target='_blank' href='https://www.unive.it/web/it/2508'>Post-Graduate Degree in Global Development and Entrepereneurship</a>
        </h3>
        <p className="text-neutral-400 text-sm dark:text-neutral-400">Ca' Foscari University, Venice // 2019 - present</p>
        <h3 className='mb-0 mt-6'>
          <a className="font-bold text-base tracking-tighter m-0" target='_blank' href='https://offertaformativa.unitn.it/en/lm/computer-science'>Bachelor's Degree in Computer Science and Economics</a>
        </h3>
        <p className="text-neutral-400 text-sm dark:text-neutral-400">University of Trento // 2014 - 2018</p>
        <h2 className="font-bold text-xl tracking-tighter">Volunteering</h2>
        <h3 className='mb-0 mt-6 font-bold text-base tracking-tighter'>ProLoco di Zero Branco</h3>
        <p className="text-neutral-400 text-sm dark:text-neutral-400">2010 - 2018</p>
        <p className='mt-0'>I worked with a local volunteer association dedicated to promoting the region, contributing to the organization of events, managing advertising campaigns, designing signage, and developing computerized order management systems.</p>
        <h3 className='mb-0 mt-6 font-bold text-base tracking-tighter'>Elderly club of Zero Branco</h3>
        <p className="text-neutral-400 text-sm dark:text-neutral-400">2013 - 2016</p>
        <p className='mt-0'>For three years, I designed and conducted computer and smartphone usage courses for the senior citizens' club in my hometown. These courses aimed to bridge the digital divide, empowering participants to navigate technology confidently and improving their digital literacy. This experience allowed me to develop strong communication and teaching skills, as well as a deep understanding of how to adapt technical concepts to different audiences.</p>
        <h2 className="font-bold text-xl tracking-tighter">Projects & Works</h2>
      </div>
      <div>
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
      </ul>
      
    </section>
  );
  
}
