// Loaded before anything from `@angular/common` or `@angular/core`, because
// importing a partially-compiled Angular package outside a spec runs its
// `ɵɵngDeclare*` factories eagerly, and those need the JIT compiler present:
// without this line, `@angular/common/http` below fails the whole suite with
// "The injectable '_PlatformLocation' needs to be compiled using the JIT
// compiler". A spec never hits this because `TestBed` has already pulled the
// compiler in by the time it imports anything.
import '@angular/compiler';
import { HttpBackend, HttpErrorResponse, type HttpEvent, type HttpRequest } from '@angular/common/http';
import { NgModule, type Type } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';
import { throwError, type Observable } from 'rxjs';

/**
 * The test environment for every spec in this project, zoneless (#304).
 *
 * WHY THERE IS NO `import 'zone.js'` HERE
 * ---------------------------------------
 * Nothing this library ships needs Zone. `@angular/core` 21 marks `zone.js`
 * `optional: true`, the published manifest declares no peer for it, and no file
 * under `src/lib/` touches the `Zone` global — so `bootstrapApplication` in a
 * consumer and `@storybook/angular`'s preview are both already zoneless. The
 * test suite was the last environment still patching `setTimeout`, `Promise`
 * and `addEventListener`, which meant every spec exercised a runtime no
 * consumer runs.
 *
 * WHAT THAT COSTS A SPEC, since it is not free
 * --------------------------------------------
 * `fakeAsync`/`tick` are Zone APIs and are gone with it. Timer-driven specs use
 * Jest's own fake timers instead — `jest.useFakeTimers()` and
 * `jest.advanceTimersByTime(ms)`. The one behavioural difference that matters:
 * `tick()` drained the microtask queue as well as the timer queue, and
 * `advanceTimersByTime()` does not. A spec waiting on a promise (a
 * `MutationObserver` callback, a `whenStable()`) has to `await` it explicitly.
 * The seven specs converted in #304 each carry a note where that applied.
 */
setupZonelessTestEnv();

/**
 * The `HttpBackend` every spec gets, in place of Angular's real one (#326).
 *
 * WHY A SPEC NEEDS ONE AT ALL
 * ---------------------------
 * `TnSpriteLoaderService` requests `assets/tn-icons/sprite-config.json` from
 * its constructor, and `@angular/common/http` provides `HttpBackend` at root as
 * a real network backend — `FetchBackend` since v22, `HttpXhrBackend` before
 * it — so every spec that renders a `tn-icon`
 * used to make a real request to `http://localhost/assets/…`. The connection is
 * refused, and jsdom's virtual console reports that failure separately from the
 * loader's own message, as a ~25-line `Error: AggregateError` stack. On main at
 * `9c1940c` that was 431 of the ~1,170 console blocks in the CI test log,
 * across 26 suites — roughly three quarters of the log's ~27k lines. It also
 * made the suite depend on whether anything happened to be listening on the
 * runner's port 80.
 *
 * WHY IT FAILS THE REQUEST RATHER THAN ANSWERING IT
 * -------------------------------------------------
 * Failing is what every spec already assumes. Answering the sprite request with
 * an empty config would flip `TnSpriteLoaderService.isSpriteLoaded()` to true,
 * which is the guard `TnIconComponent.warnMissingSpriteIcon` waits on — so each
 * spec would start logging `[TrueNAS UI] Icon '…' not found in sprite` for
 * every sprite-prefixed icon it renders, trading one kind of log noise for
 * another. With the request failed, icon resolution behaves in a spec exactly
 * as it did before this backend existed; the only thing that changes is that no
 * socket is opened.
 *
 * WHAT A SPEC THAT WANTS A RESPONSE DOES
 * --------------------------------------
 * Provide a backend of its own — `provideHttpClient()` with
 * `provideHttpClientTesting()`, or a `{ provide: HttpBackend, … }` of its own —
 * in its own `TestBed`. Providers on the testing module win over the
 * environment's, so nothing here has to be undone first. A spec that only needs
 * icons to render without asserting on them wants neither: it wants this.
 */
class NoNetworkHttpBackend implements HttpBackend {
  handle(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    return throwError(
      () =>
        new HttpErrorResponse({
          url: req.urlWithParams,
          status: 0,
          statusText: 'No HTTP backend in specs',
          error: new Error(
            `${req.method} ${req.urlWithParams} was not stubbed. Specs do not reach the network: ` +
            'provide provideHttpClient() with provideHttpClientTesting(), or an HttpBackend of ' +
            'your own, in the TestBed that needs a response.'
          ),
        })
    );
  }
}

// `useValue` rather than `useClass`, so this needs no `@Injectable()` and no
// DI reflection: it has no dependencies and no state, and one instance answers
// every spec identically.
@NgModule({
  providers: [{ provide: HttpBackend, useValue: new NoNetworkHttpBackend() }],
})
class NoNetworkHttpModule {}

/**
 * Installed on the test ENVIRONMENT rather than in a global `beforeEach` that
 * calls `TestBed.configureTestingModule`, because a dozen specs call
 * `TestBed.resetTestingModule()` in the middle of a file and reconfigure from
 * scratch — which discards anything a `beforeEach` had configured, and would
 * put those suites back on the network. The environment module is re-imported
 * into every testing module the TestBed builds, reset or not.
 *
 * `initTestEnvironment` may only be called once, so this hands back what
 * `setupZonelessTestEnv()` installed (jest-preset-angular's platform, plus its
 * `BrowserTestingModule` and rethrowing `ErrorHandler`) and re-registers it
 * with one more module appended. `TestBed.platform`/`ngModule` are public for
 * exactly this, and `initTestEnvironment`'s own documentation names
 * `resetTestEnvironment` as the way to change the providers it set.
 */
const testEnv = getTestBed();
const envModules: Type<unknown>[] = Array.isArray(testEnv.ngModule)
  ? [...testEnv.ngModule]
  : [testEnv.ngModule];
const envPlatform = testEnv.platform;

TestBed.resetTestEnvironment();
TestBed.initTestEnvironment([...envModules, NoNetworkHttpModule], envPlatform);

/**
 * A `console.warn` or `console.error` a spec did not mock FAILS that spec (#335).
 *
 * WHY, since a warning is not a failure
 * -------------------------------------
 * Every warning the suite printed was one a passing spec expected — 32 of them
 * from 7 specs, each carrying a ~30-line Angular change-detection stack, 1,111
 * of the 1,632 lines `yarn test` wrote. Expected output at that volume is not a
 * log anyone reads, so a NEW warning had nothing to stand out against: that is
 * how the 431 XHR errors in #326 and the NG0953 regression in #327 both went
 * unnoticed for weeks. Failing is what makes the next one visible, in review,
 * on the diff that caused it.
 *
 * WHAT A SPEC THAT PROVOKES ONE DELIBERATELY DOES
 * -----------------------------------------------
 * Mock it — `jest.spyOn(console, 'warn').mockImplementation(() => {})` — which
 * replaces the property and so never reaches this recorder. Where the warning
 * IS the behaviour under test, assert on the spy; where it is incidental to
 * what the spec pins, mock it with a one-line comment saying so.
 *
 * `jest.spyOn(console, 'warn')` on its own is NOT enough: without
 * `mockImplementation` the spy calls through to this recorder, and the spec
 * still fails. That is deliberate — a bare spy does not stop the printing.
 *
 * WHAT IT CANNOT SEE
 * ------------------
 * A call from an `afterAll` nested inside a `describe` lands after that block's
 * last `afterEach` and before the file's; `afterAll` below reports whatever is
 * still pending, so it is attributed to the file rather than to a test. A call
 * from module scope or a `beforeAll` is attributed to the first test that runs
 * after it, for the same reason: nothing is dropped, but the blame can be one
 * hook too late.
 */
const EXPECTED_CONSOLE_ERRORS = [
  // Fires once per spec that renders an icon, because `NoNetworkHttpBackend`
  // above fails the sprite request instead of answering it, deliberately. It is
  // the loader's own `catch`, not a jsdom XHR error, and it is one line rather
  // than a stack.
  '[TnSpriteLoader] Failed to load sprite config',
  '[TnIcon] Resolution failed',
  // Jest's own message when a late async callback logs after its test finished.
  // Not a spec's output, and nothing a spec can mock.
  'Cannot log after tests are done',
];

const unexpectedConsoleCalls: string[] = [];

function recordUnexpected(stream: 'warn' | 'error') {
  return (...args: unknown[]): void => {
    const first = args[0]?.toString() || '';
    if (stream === 'error' && EXPECTED_CONSOLE_ERRORS.some((expected) => first.includes(expected))) {
      return;
    }
    unexpectedConsoleCalls.push(`console.${stream}: ${args.map((arg) => String(arg)).join(' ')}`);
  };
}

console.warn = recordUnexpected('warn');
console.error = recordUnexpected('error');

/**
 * Drains the pending calls and throws if there were any. Called from both
 * `afterEach` and `afterAll` — draining rather than reading is what stops one
 * test's warning failing every test after it.
 */
function failOnUnexpectedConsoleCalls(): void {
  if (unexpectedConsoleCalls.length === 0) {
    return;
  }
  const calls = unexpectedConsoleCalls.join('\n  ');
  unexpectedConsoleCalls.length = 0;
  throw new Error(
    'Console output no spec expected (#335). Mock it where the spec provokes it on purpose — '
    + "jest.spyOn(console, 'warn').mockImplementation(() => {}) — and assert on the spy where "
    + `the message is the behaviour under test:\n  ${calls}`
  );
}

afterEach(failOnUnexpectedConsoleCalls);
afterAll(failOnUnexpectedConsoleCalls);
