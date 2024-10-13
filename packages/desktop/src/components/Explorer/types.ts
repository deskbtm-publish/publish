import { type PublishableType } from '../../shared';

export type NodeType = 'folder' | 'unknown' | PublishableType | string;

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
}
