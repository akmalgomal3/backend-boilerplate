type headerType =
  | 'text'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'email'
  | 'file'
  | 'image'
  | 'password'
  | 'radio'
  | 'select'
  | 'datetime'
  | 'textarea'

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
    value?: string | object[];
  };
  inlineEdit: boolean;
};
