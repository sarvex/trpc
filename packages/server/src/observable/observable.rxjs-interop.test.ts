// https://github.com/trpc/trpc/issues/3628
import * as rx from 'rxjs';
import { observable } from './observable';
import { Observable } from './types';

function toRxJs<TValue, TError>(
  obs: Observable<TValue, TError>,
): rx.Observable<TValue> {
  return new rx.Observable((subscriber) => {
    const sub = obs.subscribe({
      next: (value) => subscriber.next(value),
      error: (err) => subscriber.error(err),
      complete: () => subscriber.complete(),
    });
    return () => {
      sub.unsubscribe();
    };
  });
}

test('toRxJs()', () => {
  const obs = observable<number, Error>((observer) => {
    observer.next(1);
  });

  const rxjsObs = toRxJs(obs);

  {
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    rxjsObs.subscribe({
      next,
      error,
      complete,
    });
    expect(next.mock.calls).toHaveLength(1);
    expect(complete.mock.calls).toHaveLength(0);
    expect(error.mock.calls).toHaveLength(0);
    expect(next.mock.calls[0]![0]!).toBe(1);
  }
});

test('use rxjs operators', () => {
  const taps = {
    next: jest.fn(),
    complete: jest.fn(),
    error: jest.fn(),
  };
  const obs = observable<number, Error>((observer) => {
    observer.next(1);
  }).pipe(
    // operators:
    rx.share(),
    rx.tap(taps),
  );
  {
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    obs.subscribe({
      next,
      error,
      complete,
    });
    expect(next.mock.calls).toHaveLength(1);
    expect(complete.mock.calls).toHaveLength(0);
    expect(error.mock.calls).toHaveLength(0);
    expect(next.mock.calls[0]![0]!).toBe(1);
  }

  {
    const next = jest.fn();
    const error = jest.fn();
    const complete = jest.fn();
    obs.subscribe({
      next,
      error,
      complete,
    });
    expect(next.mock.calls).toHaveLength(0);
    expect(complete.mock.calls).toHaveLength(0);
    expect(error.mock.calls).toHaveLength(0);
  }

  expect({
    next: taps.next.mock.calls,
    error: taps.error.mock.calls,
    complete: taps.complete.mock.calls,
  }).toMatchInlineSnapshot(`
    Object {
      "complete": Array [],
      "error": Array [],
      "next": Array [
        Array [
          1,
        ],
      ],
    }
  `);
});
