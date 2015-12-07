from bs4 import BeautifulSoup
import requests
import re
import urllib
import urllib2
import os
import sys
from imageDownloader import ImageDownloader
import matlab.engine

# scrapes for film data
def get_film_data(title):	
	url = "http://www.myapifilms.com/imdb?format=JSON&actors=F&"
	url = url + "title=" + title
	response = requests.get(url)
	if response.status_code == 200:
		film_data = response.json()[0]
		actor_range = min(len(film_data['actors']), 10)
		actor_cnt = 0
		for i in xrange(actor_range):
			try:
				print film_data['actors'][i]['actorName']
				img_urls = get_actor_imgs(film_data['actors'][i]['actorName'])
				get_files_imgs(actor_cnt, img_urls, title)
				actor_cnt = actor_cnt + 1
			except:
				pass

		run_matlab(title)
	else:
		print "Error: IMDB Access"

# scrapes for image urls
def get_actor_imgs(actor):
	query = "headshot " + actor
	query = query.replace(" ", "%20")
	url = "https://www.google.com/search?source=lnms&tbm=isch&q=" + query
	
	header = {'User-Agent': 'Mozilla/5.0'}
	soup = BeautifulSoup(urllib2.urlopen(urllib2.Request(url,headers=header)), "html.parser")

	img_urls = [a['src'] for a in soup.find_all("img", {"src": re.compile("gstatic.com")})]

	return img_urls

# downloads images from provided urls
def get_files_imgs(actor_index, img_urls, path):
	for i in xrange(len(img_urls)):
		img_url = img_urls[i]
		img_path = "./" + path + "/DB/Face_DB/face_" + str(actor_index) + "_" + str(i) + ".jpg"
		print img_path
		dn = ImageDownloader(img_url, img_path)
		dn.run()

# runs matlab function
def run_matlab(path):
	eng = matlab.engine.start_matlab()
	#eng.process_face_match(nargout=0)
	eng.process_face_match(path, nargout=0)
	#print(match_id)

###### Write output file with film data

# make sure to have folders named 'Trailer-Interstellar_Face_DB' and 'Trailer-Interstellar_Face_DB_Final'
if len(sys.argv) <= 1:
	print "Error: Require film title"
else:
	get_film_data(sys.argv[1])

