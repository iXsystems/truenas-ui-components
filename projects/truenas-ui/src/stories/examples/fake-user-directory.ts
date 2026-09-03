import { Observable } from 'rxjs';
import {
  TN_USER_DIRECTORY,
  type TnDirectoryQuery,
  type TnPrincipalOption,
  type TnUserDirectory,
} from '../../lib/user-directory';

/**
 * A stand-in for the app's user store, so the `tn-user-*` / `tn-group-*` stories
 * have something to search.
 *
 * Deliberately not instant: every call resolves after a short delay, because the
 * states worth seeing in these stories — the loading row, a page arriving while
 * you keep typing, the panel filling as you scroll — only exist when the
 * directory is slower than the keyboard. A real one talks to a server and is
 * slower still.
 */

const FIRST_NAMES = [
  'ada', 'brian', 'carol', 'dennis', 'edsger', 'frances', 'grace', 'henry',
  'ivan', 'jean', 'ken', 'linus', 'margaret', 'niklaus', 'olga', 'peter',
  'quinn', 'rob', 'sophie', 'tim', 'ursula', 'vint', 'wendy', 'xavier',
];

/** 120 users, so the dropdown pages more than twice at the default page size. */
const USERS: string[] = [
  'root',
  ...FIRST_NAMES.flatMap((name) => [name, `${name}.admin`, `${name}.svc`, `ACME\\${name}`, `${name}2`]),
].slice(0, 120);

const GROUPS = [
  'wheel', 'operator', 'staff', 'builtin_administrators', 'builtin_users',
  'truenas_readonly_administrators', 'truenas_sharing_administrators',
  'developers', 'support', 'ACME\\Domain Admins', 'ACME\\Domain Users',
];

/** How the stories' fake latency is spent, in ms. */
const LATENCY = 450;

function delayed<T>(value: T, ms = LATENCY): Observable<T> {
  return new Observable<T>((subscriber) => {
    const timer = setTimeout(() => {
      subscriber.next(value);
      subscriber.complete();
    }, ms);
    return () => clearTimeout(timer);
  });
}

function page(names: string[], search: string, pageIndex: number, pageSize: number): TnPrincipalOption[] {
  const term = search.trim().toLowerCase();
  const matches = term ? names.filter((name) => name.toLowerCase().includes(term)) : names;
  return matches
    .slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
    .map((name) => ({ label: name, value: name }));
}

/**
 * The directory the stories run against. `createUser` invents a name rather than
 * opening a form — what a product does there is entirely its own business, and
 * the field only cares that something (or nothing) comes back.
 */
export class FakeUserDirectory implements TnUserDirectory {
  readonly pageSize = 25;

  /** Flipped by the stories that demonstrate a failing lookup. */
  failNextQuery = false;

  private created = 0;

  queryUsers(search: string, pageIndex: number): Observable<TnPrincipalOption[]> {
    if (this.failNextQuery) {
      this.failNextQuery = false;
      return this.failure(search);
    }
    return delayed(page(USERS, search, pageIndex, this.pageSize));
  }

  queryGroups(search: string, pageIndex: number): Observable<TnPrincipalOption[]> {
    if (this.failNextQuery) {
      this.failNextQuery = false;
      return this.failure(search);
    }
    return delayed(page(GROUPS, search, pageIndex, this.pageSize));
  }

  userExists(username: string): Observable<boolean> {
    return delayed(USERS.includes(username), 200);
  }

  groupExists(groupName: string): Observable<boolean> {
    return delayed(GROUPS.includes(groupName), 200);
  }

  createUser(_options: TnDirectoryQuery): Observable<TnPrincipalOption | null> {
    this.created += 1;
    const username = `new.user${this.created}`;
    USERS.unshift(username);
    return delayed({ label: username, value: username }, 800);
  }

  private failure(search: string): Observable<TnPrincipalOption[]> {
    return new Observable<TnPrincipalOption[]>((subscriber) => {
      const timer = setTimeout(
        () => subscriber.error(new Error(`Directory lookup failed for "${search}"`)),
        LATENCY,
      );
      return () => clearTimeout(timer);
    });
  }
}

/** Registers {@link FakeUserDirectory} for a story's module. */
export function provideFakeUserDirectory(directory = new FakeUserDirectory()) {
  return { provide: TN_USER_DIRECTORY, useValue: directory };
}
