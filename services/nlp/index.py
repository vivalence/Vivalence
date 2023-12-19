from http.server import BaseHTTPRequestHandler, HTTPServer
import os
import json

import stanza

nlp = stanza.Pipeline(lang='es', processors='tokenize,mwt,pos,lemma', download_method=None) 
def pipeline():
    sentence =request.json.get("sentence")
    print('PIPELINE', sentence)
    doc = nlp(sentence)
    return jsonify(doc.to_dict())

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Hello, World!')
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

    def do_POST(self):
        if self.path == '/pipeline':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            # print('data', data)

            sentence = data.get("sentence")
            doc = nlp(sentence)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps(doc.to_dict()).encode()
            print('data', response)
            self.wfile.write(response)

        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')

httpd = HTTPServer(('localhost', int(os.environ.get("PORT")) ), SimpleHTTPRequestHandler)
httpd.serve_forever()


# stanza.download('es')      

# @app.route('/', methods=['GET', 'POST'])
# def index():
#     print('PIPELINE', 'ALIVE')
#     return "alive"


# # print(doc)

