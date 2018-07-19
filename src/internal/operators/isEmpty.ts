import { Observable } from '../Observable';
import { Operation, FOType, Sink, SinkArg, FObs } from 'rxjs/internal/types';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function isEmpty<T>(): Operation<T, boolean> {
  return lift((source: Observable<T>, dest: Sink<boolean>, subs: Subscription) => {
    source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, subs: Subscription) => {
      if (t === FOType.NEXT) {
        dest(FOType.NEXT, false, subs);
        dest(FOType.COMPLETE, undefined, subs);
        subs.unsubscribe();
        return;
      } else {
        if (t === FOType.COMPLETE) {
          dest(FOType.NEXT, true, subs);
        }
        dest(t, v, subs);
      }
    }, subs);
  });
}
