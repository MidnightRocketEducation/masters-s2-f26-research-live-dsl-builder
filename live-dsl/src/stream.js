// RxJS liveness loop: streams editor changes, debounces, triggers ANTLR parse, emits tree/errors
import {
  combineLatest,
  debounceTime,
  from,
  fromEventPattern,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { parseEbnf } from './parser.js';

/**
 * Create a reactive parse stream from Monaco editor and options observable.
 * Emits { tree, errors } on each change.
 * @param {monaco.editor.IStandaloneCodeEditor} editor
 * @param {Observable<{compact: boolean}>} options$
 * @returns {Observable<{tree: object|null, errors: string[]}>}
 */
export function createParseStream(editor, options$ = of({ compact: true })) {
  // Stream of editor content changes
  const content$ = fromEventPattern(
    (handler) => editor.onDidChangeModelContent(handler),
    (handler, event) => handler(event),
  ).pipe(
    startWith(null),
    map(() => editor.getValue()),
  );

  // Combine content and options, debounce, then parse
  return combineLatest([content$, options$]).pipe(
    debounceTime(200),
    switchMap(([text, options]) => from(parseEbnf(text, options))),
  );
}
