import './___packages';
import { initTRPC } from '@trpc/server/src/core';

const t = initTRPC.create();

test('"then" is a reserved word', async () => {
  expect(() => {
    return t.router({
      then: t.procedure.query(() => 'hello'),
    });
  }).toThrowErrorMatchingInlineSnapshot(
    `"Reserved words used in \`router({})\` call: then"`,
  );
});

// Regression https://github.com/trpc/trpc/pull/2562
test('because it creates async fns that returns proxy objects', async () => {
  const appRouter = t.router({});
  const asyncFnThatReturnsCaller = async () => appRouter.createCaller({});

  await asyncFnThatReturnsCaller();
});

test('should not duplicate key', async () => {
  expect(() =>
    t.router({
      foo: t.router({
        '.bar': t.procedure.query(() => 'bar' as const),
      }),
      'foo.': t.router({
        bar: t.procedure.query(() => 'bar' as const),
      }),
    }),
  ).toThrow('Duplicate key: foo..bar');
});

test.only('short-hand router', async () => {
  const router = t.router({
    foo: {
      bar: t.procedure.query(() => 'bar'),
    },
  });

  expect(await router.createCaller({}).foo.bar()).toBe('bar');
});
