import { Operation, FOType, Sink, SinkArg } from 'rxjs/internal/types';
import { Observable } from '../Observable';
import { RecyclableSubscription } from 'rxjs/internal/RecyclableSubscription';
import { Subscription } from 'rxjs/internal/Subscription';
import { lift } from 'rxjs/internal/util/lift';

export function retry<T>(count: number): Operation<T, T> {
  return lift((source: Observable<T>, dest: Sink<T>, downstreamSubs: Subscription) => {
    let counter = 0;
    const upstreamSubs = new RecyclableSubscription();
    downstreamSubs.add(upstreamSubs);

    let subscribe: () => void;
    subscribe = () => {
      source(FOType.SUBSCRIBE, (t: FOType, v: SinkArg<T>, _: Subscription) => {
        if (t === FOType.ERROR) {
          counter++;
          if (counter < count) {
            upstreamSubs.recycle();
            subscribe();
          } else {
            dest(t, v, downstreamSubs);
          }
        } else {
          dest(t, v, downstreamSubs);
        }
      }, upstreamSubs);
    };

    subscribe();
  });
}
