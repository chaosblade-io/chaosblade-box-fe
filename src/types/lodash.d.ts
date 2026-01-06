// 临时修复lodash类型定义问题
declare module 'lodash' {
  interface LoDashStatic {
    get(object: any, path: string | string[], defaultValue?: any): any;
    set(object: any, path: string | string[], value: any): any;
    merge(object: any, ...sources: any[]): any;
    findKey(object: any, predicate?: any): string | undefined;
    last<T>(array: T[]): T | undefined;
    isEmpty(value: any): boolean;
    isNil(value: any): boolean;
    filter<T>(collection: T[], predicate?: any): T[];
    map<T, R>(collection: T[], iteratee?: any): R[];
    forEach<T>(collection: T[], iteratee?: any): T[];
    find<T>(collection: T[], predicate?: any): T | undefined;
    cloneDeep<T>(value: T): T;
    concat<T>(...arrays: (T[] | T)[]): T[];
    groupBy<T>(collection: T[], iteratee?: any): { [key: string]: T[] };
    lowerCase(string?: string): string;

    // 新增的方法
    uniq<T>(array: T[]): T[];
    defaultTo<T>(value: any, defaultValue: T): T;
    split(string: string, separator?: string | RegExp, limit?: number): string[];
    join<T>(array: T[], separator?: string): string;
    size(collection: any): number;
    slice<T>(array: T[], start?: number, end?: number): T[];
    trim(string?: string, chars?: string): string;
    isNumber(value: any): boolean;
    isNaN(value: any): boolean;
    isBoolean(value: any): boolean;
    isNull(value: any): boolean;
    isUndefined(value: any): boolean;
    isArray(value: any): boolean;
    isPlainObject(value: any): boolean;
    omit<T>(object: T, ...paths: string[]): Partial<T>;
    indexOf<T>(array: T[], value: T, fromIndex?: number): number;
    findIndex<T>(array: T[], predicate?: any): number;
    intersection<T>(...arrays: T[][]): T[];
    differenceBy<T>(array: T[], values: T[], iteratee?: any): T[];
    pull<T>(array: T[], ...values: T[]): T[];
    intersectionBy<T>(array: T[], values: T[], iteratee?: any): T[];
    reduce<T, R>(collection: T[], iteratee: (accumulator: R, value: T, index: number, array: T[]) => R, accumulator?: R): R;
    has(object: any, path: string | string[]): boolean;
    upperFirst(string?: string): string;
    upperCase(string?: string): string;
    isEqual(value: any, other: any): boolean;
    chunk<T>(array: T[], size?: number): T[][];
    sortBy<T>(collection: T[], iteratees?: any): T[];
    orderBy<T>(collection: T[], iteratees?: any, orders?: any): T[];
    floor(number: number, precision?: number): number;
    throttle<T extends (...args: any[]) => any>(func: T, wait?: number, options?: any): T;
    isString(value: any): boolean;
    fromPairs<T>(pairs: any[][]): { [key: string]: T };
  }

  const _: LoDashStatic;
  export = _;
}
