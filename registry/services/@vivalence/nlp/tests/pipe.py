import sys, os, json

os.environ.setdefault(
    "STANZA_RESOURCES_DIR",
    os.path.join(os.path.dirname(__file__), "..", "server", "tmp", "mnt", "stanza_resources")
)
os.environ.setdefault("SERVICE_PORT", "0")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "server"))
from server import get_pipeline, serialize_doc

req = json.loads(sys.stdin.read())
pipeline = get_pipeline(req["language"], req["processors"], req.get("package", "gsd"))
doc = pipeline(req["text"])
json.dump(serialize_doc(doc), sys.stdout)
