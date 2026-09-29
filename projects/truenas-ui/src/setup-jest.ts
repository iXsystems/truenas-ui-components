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
 * its constructor, and `@angular/common/http` 21 provides `HttpBackend` at root
 * as `useExisting: HttpXhrBackend` — so every spec that renders a `tn-icon`
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

// Suppress expected console errors in test environment
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = args[0]?.toString() || '';

  // Suppress expected icon/sprite loader errors in test environment.
  //
  // `[TnSpriteLoader] Failed to load sprite config` still fires — once per
  // spec that renders an icon — because `NoNetworkHttpBackend` above fails the
  // sprite request instead of answering it, deliberately. It is the loader's
  // own `catch`, not a jsdom XHR error, and it is one line rather than a stack.
  if (
    message.includes('[TnSpriteLoader] Failed to load sprite config') ||
    message.includes('[TnIcon] Resolution failed') ||
    message.includes('Cannot log after tests are done')
  ) {
    return;
  }

  originalConsoleError.apply(console, args);
};
