import { HttpBackend, HttpClient, HttpErrorResponse, HttpRequest, provideHttpClient, withXhr } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import type { SpriteConfig } from './sprite-loader.service';
import { defaultSpriteConfigPath, TnSpriteLoaderService } from './sprite-loader.service';

/**
 * Asserts the `HttpBackend` in the current injector is the one `setup-jest.ts`
 * installs, by what it does rather than by what class it is not.
 *
 * These guards used to read `not.toBeInstanceOf(HttpXhrBackend)`, which stopped
 * discriminating at Angular 22: the real root backend is `FetchBackend` from v22
 * on and `HttpXhrBackend` before it, so the assertion now passes against the
 * very default it was written to exclude. The failure it answers — the shim
 * installed in a `beforeEach` instead of on the test environment, so a mid-file
 * `resetTestingModule()` drops it — would leave this green while every icon spec
 * after the reset went back to opening sockets (#326). Asserting the behaviour
 * is version-independent.
 */
async function expectNoNetworkBackend(): Promise<void> {
  const backend = TestBed.inject(HttpBackend);

  const error = await firstValueFrom(
    backend.handle(new HttpRequest('GET', '/anything-at-all'))
  ).catch((e: unknown) => e);

  expect(error).toBeInstanceOf(HttpErrorResponse);
  expect((error as HttpErrorResponse).statusText).toBe('No HTTP backend in specs');
}

/**
 * The sprite loader requests its config from its own constructor, so every
 * spec that renders an icon makes an HTTP request whether it meant to or not.
 * `setup-jest.ts` answers those with a backend that never touches the network
 * (#326); these are the guards on that, and on a spec still being able to
 * supply a config when it wants one.
 */
describe('HTTP in specs, with no backend of the spec’s own', () => {
  it('provides its own HttpBackend at root, in place of Angular’s network one', async () => {
    await expectNoNetworkBackend();
  });

  it('fails an unstubbed request instead of making one', async () => {
    const http = TestBed.inject(HttpClient);

    const error = await firstValueFrom(http.get('/anything-at-all')).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(HttpErrorResponse);
    expect((error as HttpErrorResponse).statusText).toBe('No HTTP backend in specs');
  });

  it('names the request and the way out in the error it throws', async () => {
    const http = TestBed.inject(HttpClient);

    const error = (await firstValueFrom(http.post('/save', {})).catch(
      (e: unknown) => e
    )) as HttpErrorResponse;

    expect((error.error as Error).message).toContain('POST /save');
    expect((error.error as Error).message).toContain('provideHttpClientTesting()');
  });

  it('still applies after a spec resets and reconfigures the testing module', async () => {
    // The backend is installed on the test environment rather than in a global
    // beforeEach for exactly this: a dozen specs reset mid-file, and a
    // beforeEach's providers do not survive that.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    await expectNoNetworkBackend();
  });

  it('leaves the sprite loader unloaded, resolving no icon', async () => {
    // `getIconUrl` warns when it is asked for an icon before the sprite has
    // loaded, which is the state under test — silenced so this spec does not
    // add a block to the very log #326 is clearing.
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const loader = TestBed.inject(TnSpriteLoaderService);

    await expect(loader.ensureSpriteLoaded()).resolves.toBe(false);
    expect(loader.isSpriteLoaded()).toBe(false);
    expect(loader.getIconUrl('folder')).toBeNull();

    warn.mockRestore();
  });
});

describe('TnSpriteLoaderService with a sprite config the spec supplies', () => {
  const config: SpriteConfig = {
    iconUrl: 'assets/tn-icons/sprite.svg?v=abc123',
    icons: ['folder', 'mdi-server'],
  };

  let httpMock: HttpTestingController;
  let loader: TnSpriteLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withXhr()), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    // Injecting the service is what fires the request, so the expectation
    // below has to come after it rather than in its own arrange step.
    loader = TestBed.inject(TnSpriteLoaderService);
    httpMock.expectOne(defaultSpriteConfigPath).flush(config);
  });

  afterEach(() => httpMock.verify());

  it('loads the config the spec answered with', async () => {
    await expect(loader.ensureSpriteLoaded()).resolves.toBe(true);
    expect(loader.getSpriteConfig()).toEqual(config);
  });

  it('resolves an icon the config lists, as a fragment on the sprite URL', async () => {
    await loader.ensureSpriteLoaded();

    expect(loader.getIconUrl('folder')).toBe(`${config.iconUrl}#folder`);
  });

  it('resolves no icon the config does not list', async () => {
    await loader.ensureSpriteLoaded();

    expect(loader.getIconUrl('not-in-this-sprite')).toBeNull();
  });
});
