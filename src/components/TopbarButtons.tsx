import * as React from 'react';
import { useEditor } from '@grapesjs/react';
import {
  mdiArrowULeftTop,
  mdiArrowURightTop,
  mdiBorderRadius,
  mdiFullscreen,
  mdiXml,
  mdiEye,
  mdiEyeOff,
} from '@mdi/js';
import Icon from '@mdi/react';
import { useEffect, useState } from 'react';
import { BTN_CLS, MAIN_BORDER_COLOR, cx } from './common';
import './TopbarButtons.css';

interface CommandButton {
  id: string;
  iconPath: string;
  options?: Record<string, any>;
  disabled?: () => boolean;
}

export default function TopbarButtons({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const editor = useEditor();
  const [, setUpdateCounter] = useState(0);
  const { UndoManager, Commands } = editor;
  const [isPreview, setIsPreview] = useState(false);

  const togglePreview = () => {
    if (editor) {
      const canvasDoc = editor.Canvas.getDocument();
      if (canvasDoc) {
        const wrapperEl = canvasDoc.querySelector('body');
        if (wrapperEl) {
          if (isPreview) {
            // 退出预览模式
            wrapperEl.style.pointerEvents = '';
            wrapperEl.style.userSelect = '';
            const frameEl = editor.Canvas.getFrameEl();
            if (frameEl) {
              frameEl.style.border = '';
            }
            const wrapper = editor.getWrapper();
            if (wrapper) {
              wrapper.removeClass('preview-mode');
            }
            // 显示左侧工具栏、topbar 和右侧工具栏
            const leftPanel = document.querySelector<HTMLElement>('.gjs-pn-views-container');
            if (leftPanel) {
              leftPanel.style.display = 'block';
            }
            const topbar = document.querySelector<HTMLElement>('.gjs-top');
            if (topbar) {
              topbar.style.display = 'flex';
            }
            const rightSidebar = document.querySelector<HTMLElement>('.right-sidebar');
            if (rightSidebar) {
              rightSidebar.style.display = 'block';
            }
          } else {
            // 进入预览模式
            wrapperEl.style.pointerEvents = 'none';
            wrapperEl.style.userSelect = 'none';
            const frameEl = editor.Canvas.getFrameEl();
            if (frameEl) {
              frameEl.style.border = 'none';
            }
            const wrapper = editor.getWrapper();
            if (wrapper) {
              wrapper.addClass('preview-mode');
            }
            // 隐藏左侧工具栏、topbar 和右侧工具栏
            const leftPanel = document.querySelector<HTMLElement>('.gjs-pn-views-container');
            if (leftPanel) {
              leftPanel.style.display = 'none';
            }
            const topbar = document.querySelector<HTMLElement>('.gjs-top');
            if (topbar) {
              topbar.style.display = 'none';
            }
            const rightSidebar = document.querySelector<HTMLElement>('.right-sidebar');
            if (rightSidebar) {
              rightSidebar.style.display = 'none';
            }
          }
          setIsPreview(!isPreview);
        }
      }
    }
  };

  const cmdButtons: CommandButton[] = [
    {
      id: 'core:component-outline',
      iconPath: mdiBorderRadius,
    },
    {
      id: 'core:fullscreen',
      iconPath: mdiFullscreen,
      options: { target: '#root' },
    },
    {
      id: 'core:open-code',
      iconPath: mdiXml,
    },
    {
      id: 'core:undo',
      iconPath: mdiArrowULeftTop,
      disabled: () => !UndoManager.hasUndo(),
    },
    {
      id: 'core:redo',
      iconPath: mdiArrowURightTop,
      disabled: () => !UndoManager.hasRedo(),
    },
  ];

  useEffect(() => {
    const cmdEvent = 'run stop';
    const updateEvent = 'update';
    const updateCounter = () => setUpdateCounter((value) => value + 1);
    const onCommand = (id: string) => {
      cmdButtons.find((btn) => btn.id === id) && updateCounter();
    };
    editor.on(cmdEvent, onCommand);
    editor.on(updateEvent, updateCounter);

    return () => {
      editor.off(cmdEvent, onCommand);
      editor.off(updateEvent, updateCounter);
    };
  }, [editor]);

  return (
    <div className={cx('flex gap-3', className)}>
      <button
        type="button"
        className={cx(BTN_CLS, MAIN_BORDER_COLOR)}
        onClick={togglePreview}
      >
        <Icon path={isPreview ? mdiEyeOff : mdiEye} size={1} />
      </button>
      {cmdButtons.map(({ id, iconPath, disabled, options = {} }) => (
        <button
          key={id}
          type="button"
          className={cx(
            BTN_CLS,
            MAIN_BORDER_COLOR,
            Commands.isActive(id) && 'text-sky-300',
            disabled?.() && 'opacity-50'
          )}
          onClick={() =>
            Commands.isActive(id)
              ? Commands.stop(id)
              : Commands.run(id, options)
          }
          disabled={disabled?.()}
        >
          <Icon path={iconPath} size={1} />
        </button>
      ))}
    </div>
  );
}