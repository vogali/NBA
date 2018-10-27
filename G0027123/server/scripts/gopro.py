#from time import gmtime, strftime
import sys

from goprocam import GoProCamera
from goprocam import constants

video = sys.argv[1]

gpCam = GoProCamera.GoPro()
gpCam.overview()

#timestamp = strftime("%Y-%m-%d-%H_%M_%S", gmtime())
gpCam.downloadLastMedia(gpCam.shoot_video(3), video)
