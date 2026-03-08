export enum MenuPopupDataAttributes {
  /**
   * Present when the menu is open.
   */
  open = "data-open",
  /**
   * Present when the menu is closed.
   */
  closed = "data-closed",
  /**
   * Indicates which side the popup is positioned relative to the trigger.
   * @type {'top' | 'bottom' | 'left' | 'right' | 'inline-end' | 'inline-start'}
   */
  side = "data-side",
  /**
   * Indicates how the popup is aligned relative to specified side.
   * @type {'start' | 'center' | 'end'}
   */
  align = "data-align",
}
