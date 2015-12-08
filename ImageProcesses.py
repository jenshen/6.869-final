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
def get_film_data(title, frame_cnt):
	url = "http://www.myapifilms.com/imdb?format=JSON&actors=F&"
	url = url + "title=" + title.replace("_", "%20")
	path = "Film-" + title
	response = requests.get(url)
	if response.status_code == 200:
		film_data = response.json()[0]
		actor_range = min(len(film_data['actors']), 10)
		actor_cnt = 0
		actor_list = []
		for i in xrange(actor_range):
			try:
				print film_data['actors'][i]['actorName']
				img_urls = get_actor_imgs(film_data['actors'][i]['actorName'])
				get_files_imgs(actor_cnt, img_urls, path)
				actor_cnt = actor_cnt + 1
				actor_list.append(film_data['actors'][i]['actorName'])
			except:
				pass
		f1 = open("./" + path + "/Data/data_film.txt", 'w+')
		f1.write(str(frame_cnt) + "\n" + str(actor_cnt))
		f1.close()
		f2 = open("./" + path + "/Data/data_actors.txt", 'w+')
		f2.write("parseDataActors({\n\"actors\":" + str(actor_list) + "\n" + ")};");
		f2.close()
		run_matlab(path)
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
	eng.process_face_match(path, nargout=0)


# Call with args: film_title frame_count
if len(sys.argv) < 3:
	print "Error: Require film title and frame count"
else:
	get_film_data(sys.argv[1], sys.argv[2])

