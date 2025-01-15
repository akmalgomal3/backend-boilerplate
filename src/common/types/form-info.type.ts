export type FormInfo = {
    id: string | null, 
    title: string, 
    description: string, 
    fields: FieldInfo[]
}

type FieldInfo = {
    type: string, 
    key: string, 
    label: string, 
    value: string | object, 
    required: boolean, 
    placeholder: string, 
    option: {
        type?: 'url' | 'array' | 'suggestion', 
        value?: string
    } | object, 
    visible: boolean, 
    disable: boolean, 
    prefix: string, 
    suffix: string
}