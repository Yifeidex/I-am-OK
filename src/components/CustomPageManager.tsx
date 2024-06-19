import * as React from 'react';
import { PagesResultProps } from '@grapesjs/react';
import { BTN_CLS, MAIN_BORDER_COLOR, cx } from './common';
import Icon from '@mdi/react';
import { mdiDelete } from '@mdi/js';

export default function CustomPageManager({
  pages,
  selected,
  add,
  select,
  remove,
}: PagesResultProps) {
  const addNewPage = async () => {
    try {
      const response = await fetch('/template.html');
      const html = await response.text();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const templateContent = tempDiv.querySelector('#gjs')?.innerHTML;

      const nextIndex = pages.length + 1;
      // Generate links to all existing pages
      const links = pages
        .map(
          (page) =>
            `<a href="#" id="linkToPage${page.getId()}">${page.getName()}</a>`
        )
        .join('<br/>');

      const newPageContent = `
      <body>
        ${templateContent || `<h1>Page content ${nextIndex}</h1>`}
        <div>
          ${links}
        </div>
      </body>
    `;

      add({
        name: `New page ${nextIndex}`,
        component: newPageContent,
      });
    } catch (error) {
      console.error('Failed to add new page', error);
    }
  };

  return (
    <div className="gjs-custom-page-manager">
      <div className="p-2">
        <button type="button" className={BTN_CLS} onClick={addNewPage}>
          Add new page
        </button>
      </div>
      {pages.map((page, index) => (
        <div
          key={page.getId()}
          className={cx(
            'flex items-center py-2 px-4 border-b',
            index === 0 && 'border-t',
            MAIN_BORDER_COLOR
          )}
        >
          <button
            type="button"
            className="flex-grow text-left"
            onClick={() => select(page)}
          >
            {page.getName() || 'Untitled page'}
          </button>
          {selected !== page && (
            <button type="button" onClick={() => remove(page)}>
              <Icon size={0.7} path={mdiDelete} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}