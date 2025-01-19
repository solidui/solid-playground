import Dismiss from 'solid-dismiss';
import { Icon } from 'solid-heroicons';
import { documentPlus, ellipsisVertical, trash } from 'solid-heroicons/outline';
import { Component, For, Show, createSignal } from 'solid-js';
import { useFloating } from 'solid-floating-ui';

interface File {
  name: string;
}
interface Folder {
  name: string;
  files: File[];
  folders: Folder[];
}

// File icons from https://github.com/jesseweed/seti-ui
// typescript.svg and default.svg

export const FileTree: Component<{
  folders: Folder[];
  files: File[];
  onClick: (path: string) => void;
  newFile: (path: string) => void;
  deleteFile: (path: string) => void;
}> = (props) => {
  let input!: HTMLInputElement;
  const [newFile, setNewFile] = createSignal<string | undefined>(undefined);

  const RenderFolder = (name: string, folder: Folder) => {
    return (
      <>
        <div>{folder.name}</div>
        <For each={folder.folders}>{(inner) => RenderFolder(`${name}/${inner.name}`, inner)}</For>
        <For each={folder.files}>
          {(file) => <div onClick={() => props.onClick(`${name}/${file.name}`)}>{file.name}</div>}
        </For>
      </>
    );
  };

  const createNewFile = () => {
    props.newFile(newFile()!);
    setNewFile(undefined);
  };

  const [menuButton, setMenuButton] = createSignal<HTMLButtonElement | false>(false);
  const [selectedFile, setSelectedFile] = createSignal<File | undefined>(undefined);
  const [floating, setFloating] = createSignal<HTMLDivElement>();
  const position = useFloating(() => menuButton() || undefined, floating);

  return (
    <div class="relative h-full w-full rounded-xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
      <div class="border-bord flex items-center justify-between border-b px-4 py-1 dark:bg-[#252526]">
        <h1>Files</h1>
        <button
          class="rounded p-1 text-xs hover:bg-gray-200 dark:hover:bg-[rgba(90,93,94,0.31)]"
          onClick={() => {
            setNewFile('');
            input.focus();
          }}
        >
          <Icon path={documentPlus} class="h-4" />
        </button>
      </div>
      <For each={props.folders}>{(folder) => RenderFolder(folder.name, folder)}</For>
      <For each={props.files}>
        {(file) => (
          <div
            class="hover-visible-button flex cursor-pointer items-center rounded pr-1 hover:bg-[#e4e5e6] dark:hover:bg-[rgba(90,93,94,0.31)]"
            onClick={() => props.onClick(file.name)}
            draggable="true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="inline-block h-[24px] shrink-0">
              <path
                d="M15.6 11.8h-3.4V22H9.7V11.8H6.3V10h9.2v1.8zm7.7 7.1c0-.5-.2-.8-.5-1.1-.3-.3-.9-.5-1.7-.8-1.4-.4-2.5-.9-3.3-1.5-.7-.6-1.1-1.3-1.1-2.3 0-1 .4-1.8 1.3-2.4.8-.6 1.9-.9 3.2-.9 1.3 0 2.4.4 3.2 1.1.8.7 1.2 1.6 1.2 2.6h-2.3c0-.6-.2-1-.6-1.4-.4-.3-.9-.5-1.6-.5-.6 0-1.1.1-1.5.4-.4.3-.5.7-.5 1.1 0 .4.2.7.6 1 .4.3 1 .5 2 .8 1.3.4 2.3.9 3 1.5.7.6 1 1.4 1 2.4s-.4 1.9-1.2 2.4c-.8.6-1.9.9-3.2.9-1.3 0-2.5-.3-3.4-1s-1.5-1.6-1.4-2.9h2.4c0 .7.2 1.2.7 1.6.4.3 1.1.5 1.8.5s1.2-.1 1.5-.4c.2-.3.4-.7.4-1.1z"
                fill="#529BBA"
              />
            </svg>
            <span class="shrink-1 min-w-0 overflow-hidden text-ellipsis">{file.name}</span>
            <button
              class="ml-auto hidden rounded hover:bg-[rgba(90,93,94,0.31)]"
              onClick={(e) => {
                setMenuButton(e.currentTarget);
                setSelectedFile(file);
                e.stopPropagation();
                floating()?.focus();
              }}
            >
              <Icon path={ellipsisVertical} class="h-4" />
            </button>
          </div>
        )}
      </For>
      <Dismiss
        open={() => menuButton() != false}
        setOpen={() => setMenuButton(false)}
        menuButton={menuButton}
        cursorKeys
        mount="#app"
      >
        <div
          style={{
            position: position.strategy,
            top: `${position.y ?? 0}px`,
            left: `${position.x ?? 0}px`,
          }}
          class="dark:bg-darkbg border-bord absolute z-10 w-min rounded border bg-white"
          ref={setFloating}
        >
          <button
            class="mx-2 my-1 block w-[100px] cursor-pointer dark:text-white"
            onClick={() => {
              const file = selectedFile()!;
              setMenuButton(false);
              setSelectedFile(undefined);
              props.deleteFile(file.name);
            }}
          >
            <Icon path={trash} class="inline-block h-4 px-1" />
            Delete file
          </button>
        </div>
      </Dismiss>
      <Show when={newFile() !== undefined}>
        <div class="flex cursor-pointer rounded pr-1 hover:bg-[#e4e5e6] dark:hover:bg-[rgba(90,93,94,0.31)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="100 0 1000 1000"
            class="inline-block h-[24px] shrink-0 fill-black dark:fill-white"
          >
            <path d="M394.1 537.8h411.7v54.7H394.1v-54.7zm0-130.3H624v54.7H394.1v-54.7zm0-130.3h411.7v54.7H394.1v-54.7zm0 390.9H700v54.7H394.1v-54.7z" />
          </svg>
          <input
            type="text"
            class="border-solid-default min-w-0 rounded border px-1"
            value={newFile()}
            onInput={(e) => setNewFile(e.currentTarget.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') createNewFile();
            }}
            onBlur={createNewFile}
            ref={input}
          />
        </div>
      </Show>
    </div>
  );
};
