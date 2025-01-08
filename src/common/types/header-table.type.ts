type headerType =
  | 'string'
  | 'enum'
  | 'date'
  | 'number'
  | 'boolean'
  | 'url'
  | 'image'
  | 'datetime'

export type HeaderTable = {
  key: string;
  label: string;
  filterable: boolean;
  sortable: boolean;
  editable: boolean;
  searchable: boolean;
  type: headerType;
  option: {
    type?: 'url' | 'array' | 'suggestion';
    value?: string;
  }
  inlineEdit: boolean;
};
