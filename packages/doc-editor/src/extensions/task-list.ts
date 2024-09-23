import * as classes from '../components/DocEditor.module.css';

import TipTapTaskList from '@tiptap/extension-task-list';

export const TaskList = TipTapTaskList.extend({
  addKeyboardShortcuts: () => ({
    'Mod-[': ({ editor }: any) => {
      editor.chain().focus().liftListItem('taskItem').run();
      return true;
    },
    'Mod-]': ({ editor }: any) => {
      editor.chain().focus().sinkListItem('taskItem').run();
      return true;
    },
  }),
}).configure({
  HTMLAttributes: {
    class: `${classes.taskList} mantine-RichTextEditor-taskList`,
  },
});
