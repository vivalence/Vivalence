import sys
import subprocess
import time
import re
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ChangeHandler(FileSystemEventHandler):
    def __init__(self, ignored_patterns):
        self.ignored_patterns = ignored_patterns
        self.last_run_time = time.time()
        self.debounce_seconds = 2
        self.process = None
        self.start_process()

    def start_process(self):
        self.stop_process()
        self.process = subprocess.Popen(["poetry", "run", "python", "src/index.py"])

    def stop_process(self):
        if self.process is not None:
            self.process.terminate()
            self.process.wait()

    def on_modified(self, event):
        if any(re.search(pattern, event.src_path) for pattern in self.ignored_patterns):
            return
        current_time = time.time()
        if current_time - self.last_run_time > self.debounce_seconds:
            print(f"Change detected: {event.src_path}. Restarting script.")
            self.last_run_time = current_time
            self.start_process()

    def on_created(self, event):
        self.on_modified(event)

if __name__ == "__main__":
    ignored_patterns = ['\.git', '.*\.log']  # Add patterns here
    path = './src'
    event_handler = ChangeHandler(ignored_patterns)
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        event_handler.stop_process()
    observer.join()
