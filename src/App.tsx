import * as React from 'react';
import GjsEditor, {
  AssetsProvider,
  Canvas,
  ModalProvider,
} from '@grapesjs/react';
import type { Editor, EditorConfig, Page } from 'grapesjs';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CustomModal from './components/CustomModal';
import CustomAssetManager from './components/CustomAssetManager';
import Topbar from './components/Topbar';
import RightSidebar from './components/RightSidebar';
import './style.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const fetchTemplate = async (templateName) => {
  try {
    const response = await fetch(`/${templateName}.html`);
    const html = await response.text();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.querySelector('#gjs')?.innerHTML || '';
  } catch (error) {
    console.error(`Failed to fetch template ${templateName}`, error);
    return '';
  }
};

const initializeGjsOptions = async (): Promise<EditorConfig> => {
  const templateContent1 = await fetchTemplate('template');
  const templateContent2 = await fetchTemplate('template2');
  const templateContent3 = await fetchTemplate('template3');
  const templateContent4 = await fetchTemplate('template4');

  return {
    height: '100vh',
    storageManager: false,
    undoManager: { trackSelection: false },
    selectorManager: { componentFirst: true },
    projectData: {
      assets: [
        'https://via.placeholder.com/350x250/78c5d6/fff',
        'https://via.placeholder.com/350x250/459ba8/fff',
        'https://via.placeholder.com/350x250/79c267/fff',
        'https://via.placeholder.com/350x250/c5d647/fff',
        'https://via.placeholder.com/350x250/f28c33/fff',
      ],
      pages: [
        {
          name: 'Home page',
          component: `
            <body id="iz3s">
              ${templateContent1}
            </body>
          `,
        },
        {
          name: 'page2',
          component: `
            <body id="iz3s">
              ${templateContent2}
            </body>
          `,
        },
        {
        },
        {
          name: 'page4',
          component: `
            <body id="iz3s">
              ${templateContent4}
            </body>
          `,
        },
      ],
    },
  };
};

export default function App() {
  const [gjsOptions, setGjsOptions] = React.useState<EditorConfig | null>(null);
  const [pages, setPages] = React.useState<Page[]>([]);

  React.useEffect(() => {
    initializeGjsOptions().then(setGjsOptions);
  }, []);

  const editorRef = React.useRef<Editor | null>(null);

  const onEditor = (editor: Editor) => {
    console.log('Editor loaded');
    (window as any).editor = editor;
    editorRef.current = editor;

    setPages(editor.Pages.getAll());

    editor.on('page:add', () => {
      const newPages = editor.Pages.getAll();
      setPages(newPages);
      updateAllPages(newPages);
    });

    editor.on('load', () => {
      const doc = editor.Canvas.getDocument();
      doc.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.id && target.id.startsWith('linkToPage')) {
          e.preventDefault();
          const pageId = target.id.replace('linkToPage', '');
          const targetPage = editor.Pages.get(pageId);
          if (targetPage) {
            editor.Pages.select(targetPage);
          }
        }
      });
    });
  };

  const updateAllPages = (allPages: Page[]) => {
    allPages.forEach((page) => {
      const links = allPages
        .map(
          (p) =>
            `<a href="#" id="linkToPage${p.getId()}">Go to ${p.getName()}</a>`
        )
        .join('<br>');
      const updatedComponent = page.getMainComponent();
      updatedComponent.set(
        'content',
        `
        <body>
          ${updatedComponent.get('content')}
          <footer>
            ${links}
          </footer>
        </body>
      `
      );
    });
  };

  if (!gjsOptions) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <GjsEditor
        className="gjs-custom-editor text-white bg-slate-900"
        grapesjs="https://unpkg.com/grapesjs"
        grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
        options={gjsOptions}
        plugins={[
          {
            id: 'gjs-blocks-basic',
            src: 'https://unpkg.com/grapesjs-blocks-basic',
          },
        ]}
        onEditor={onEditor}
      >
        <div className="flex h-full relative">
          <div className="right-sidebar w-[300px] bg-dark-gray border-r flex-none">
            <RightSidebar />
          </div>
          <div className="flex flex-col flex-grow">
            <Topbar className="min-h-[48px]" />{' '}
            <Canvas className="flex-grow" />
          </div>
        </div>
        <ModalProvider>
          {({ open, title, content, close }) => (
            <CustomModal
              open={open}
              title={title}
              children={content}
              close={close}
            />
          )}
        </ModalProvider>
        <AssetsProvider>
          {({ assets, select, close, Container }) => (
            <Container>
              <CustomAssetManager
                assets={assets}
                select={select}
                close={close}
              />
            </Container>
          )}
        </AssetsProvider>
      </GjsEditor>
    </ThemeProvider>
  );
}