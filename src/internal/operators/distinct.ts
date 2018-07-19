import { lift } from 'rxjs/internal/util/lift';
import { Observable } from '../Observable';
import { FOType, ObservableInput, Operation, Sink, SinkArg } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { fromSource } from 'rxjs/internal/create/from';
import { tryUserFunction, resultIsError } from 'rxjs/internal/util/userFunction';

export function distinct<T, K>(keySelector?: (value: T) => K, flushes?: ObservableInput<any>): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, subs: Subscription)  =>{
    const values = new Set<T>();
    if (flushes) {
      fromSource(flushes)(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<any>, subs: Subscription) => {
        if (t === FOType.NEXT) {
          values.clear();
        }
      }, subs);
    }
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        if (values.has(v)) return;
        if (keySelector) {
          v = tryUserFunction(keySelector, v);
          if (resultIsError(v)) {
            dest(FOType.ERROR, v.error, subs);
            subs.unsubscribe();
            return;
          }
        }
      }
      dest(t, v, subs);
    }, subs);
  });
}
