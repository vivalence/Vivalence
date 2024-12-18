import { Daemon } from "@vivalence/types";

export default function install(daemon: Daemon) {
  for (const runtime of daemon.runtimes.values()) {
    // find all installed modules that dont have an owner anymore and uninstall them.
    // then sometheing something about the orphaned curriculum.
    // maybe some onthology.remedy healing magic whatever no clue not todays problem
  }

  return daemon;
}
