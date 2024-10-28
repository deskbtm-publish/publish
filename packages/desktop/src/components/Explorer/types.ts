import { type PublishableType } from '../../shared';

export type FileNodeType = 'image' | 'text';

export type NodeType = 'folder' | 'unknown' | FileNodeType | PublishableType;

export interface NodeData {
  type: NodeType;
  /**
   * Droppable collapsed
   */
  collapsed?: boolean;

  size: number;
  /**
   * Create time
   */
  birthTime: string;
  /**
   * Last modified time
   */
  modifiedTime: string;

  /**
   * Set the color for the specified node type, which can be selected in Explorer or displayed on hover.
   */
  color?: string | { color?: string; hoverColor?: string };
}
