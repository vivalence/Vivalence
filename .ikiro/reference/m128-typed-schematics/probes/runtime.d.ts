export interface Daemon {
  slug: string;
}

declare module "@vivalence/typology" {
  interface Live {
    daemon: Daemon;
  }
}
