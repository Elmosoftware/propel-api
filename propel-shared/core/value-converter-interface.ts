export interface ValueConverterInterface<T> {
    convert(value: any): T
}
