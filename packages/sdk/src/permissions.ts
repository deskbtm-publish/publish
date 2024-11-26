export const permissions = [
  /**
   * With GUI
   */
  'graphical',
  /**
   * Get network state
   * Level: normal
   */
  'network:state',
  'network:internet',
  /**
   * Level: normal
   */
  'wifi',
  /**
   * Level: normal
   */
  'bluetooth',
  /**
   * Level: normal
   */
  'geolocation',
  /**
   * Level: normal
   */
  'storage:cookie',
  'storage:local',
  'storage:db',
  /**
   * Level: normal
   *
   */
  'clipboard:write',
  'clipboard:read',
  /**
   * Read external plugin storage
   * Level: dangerous
   */
  'storage:external:APP_NAME:cookie',
  'storage:external:APP_NAME:local',
  'storage:external:APP_NAME:db',
  /**
   * System file systems (OPFS)
   * Level: dangerous
   * Web available
   */
  'fs:read',
  'fs:write',
] as const;

export type PermissionsManifest = (typeof permissions)[number][];
