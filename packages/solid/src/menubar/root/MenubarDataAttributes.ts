export enum MenubarDataAttributes {
  /**
   * Present when the corresponding menubar is modal.
   */
  modal = "data-modal",
  /**
   * Determines the orientation of the menubar.
   * @type {'horizontal' | 'vertical'}
   * @default 'horizontal'
   */
  orientation = "data-orientation",
  /**
   * Whether any submenu within the menubar is open.
   */
  hasSubmenuOpen = "data-has-submenu-open",
}
