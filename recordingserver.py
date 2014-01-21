#!/usr/bin/env python

# Recording server - a little utility
# copyright (c) 2014 Peter Corbett - see LICENSE

from http.server import HTTPServer, SimpleHTTPRequestHandler;
from binascii import a2b_base64

# Image number
imgn = 0

class MyHandler(SimpleHTTPRequestHandler):
		
	# Assume you're being sent a data URL with a PNG in, save it, increment the counter.
	# Brutally, brutally simple.
	# Don't even worry about which page we're allegedly on
	def do_POST(self):
		global imgn
		length = int(self.headers.get('content-length'))
		data_string = self.rfile.read(length)
		str = data_string.decode('UTF-8')
		print(str[:50])
		if str.startswith("data:image/png;base64,"):
			# Something that should be cleaned up were there to be a proper version of this
			file = open("images/img%05d.png" % imgn, "wb")
			imgn += 1
			file.write(a2b_base64(str.replace("data:image/png;base64,", "")))
			file.close()
		resp = "OK!\n"
		resp = bytes(resp, 'UTF-8')
		self.send_response(200)
		self.send_header("Content-type", "text/plain")
		self.send_header("Content-length", len(resp))
		self.end_headers()
		self.wfile.write(resp)

def main():
	print("Starting recording server!")
	server_address = ('', 8080)
	httpd = HTTPServer(server_address, MyHandler)
	httpd.serve_forever()
	
if __name__=="__main__":
	main()