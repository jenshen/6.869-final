import urllib
from threading import Thread

class ImageDownloader(Thread):
    def __init__(self, file_url, save_path):
        self.file_url = file_url
        self.save_path = save_path


    def run(self):
        urllib.urlretrieve(self.file_url, self.save_path)
