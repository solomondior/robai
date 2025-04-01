/**
 * Copyright (c) 2018 Jed Watson.
 * Licensed under the MIT License (MIT), see:
 *
 * @link http://jedwatson.github.io/classnames
 */

export type ClassValue = string | number | boolean | undefined | null;
export type ClassNamesArg = ClassValue | ClassValue[] | Record<string, any>;

/**
 * A simple JavaScript utility for conditionally joining classNames together.
 *
 * @param args A series of classes or object with key that are class and values
 * that are interpreted as boolean to decide whether or not the class
 * should be included in the final class.
 */
export function classNames(...args: ClassNamesArg[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    const argType = typeof arg;

    if (argType === 'string' || argType === 'number') {
      classes.push(arg.toString());
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        const inner = classNames(...arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === 'object') {
      const objArg = arg as Record<string, unknown>;
      for (const key in objArg) {
        if (Object.prototype.hasOwnProperty.call(objArg, key) && objArg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
