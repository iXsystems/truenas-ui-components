export enum InputType {
  Email = 'email',
  Number = 'number',
  Password = 'password',
  PlainText = 'text',
  /**
   * Data-size field: the form model holds a raw byte count (a number), while the
   * field displays/accepts a human-readable string (e.g. `2 GiB`, `500M`, `2 TB`).
   * See `tn-input`'s `sizeStandard` / `sizeDefaultUnit` inputs to tune formatting
   * and bare-number parsing.
   */
  Size = 'size',
}
