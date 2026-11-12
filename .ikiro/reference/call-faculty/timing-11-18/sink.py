# limit: 900 chars · 11-18 timing helper, a free local port
import http.server, socketserver, sys, os
os.chdir(sys.argv[1])
class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        size = int(self.headers.get("content-length", 0))
        name = os.path.basename(self.path) or "out.txt"
        open(os.path.join("out", name), "wb").write(self.rfile.read(size))
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
    def log_message(self, *a): pass
os.makedirs("out", exist_ok=True)
with socketserver.TCPServer(("127.0.0.1", 0), H) as s:
    open("sink.port", "w").write(str(s.server_address[1]))
    s.serve_forever()
