# FR.py 

import boto3
import face_recognition
import io
from PIL import Image
from botocore.client import Config
from tkinter import filedialog




access_key_id = 'AKIAYGINPQ2H42KMVZM3'
secret_access_key = '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'
region_name = 'eu-north-1'


# Initialize boto3 client for S3
s3 = boto3.client(
    's3',
    aws_access_key_id=access_key_id,
    aws_secret_access_key=secret_access_key,
    region_name=region_name,
    config=Config(signature_version='s3v4')
)

def search_faces( folder_name, face_to_find_key,bucket_name = 'photo-club-s3'):
    # Download the reference image from S3
    file_stream = io.BytesIO()
    s3.download_fileobj(Bucket=bucket_name, Key=face_to_find_key, Fileobj=file_stream)
    file_stream.seek(0)
    known_image = face_recognition.load_image_file(file_stream)
    known_encoding = face_recognition.face_encodings(known_image)[0]


    # List objects within a specified bucket and folder
    obj_list = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
    if 'Contents' not in obj_list:
        return []

    found_faces = []
    for obj in obj_list['Contents']:
        # Download image from S3
        obj_key = obj['Key']
        file_stream = io.BytesIO()
        s3.download_fileobj(Bucket=bucket_name, Key=obj_key, Fileobj=file_stream)
        file_stream.seek(0)
        image = face_recognition.load_image_file(file_stream)

        # Find all faces in this image
        face_encodings = face_recognition.face_encodings(image)
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces([known_encoding], face_encoding)
            if matches[0]:
                found_faces.append(obj_key)
                break

    return found_faces

# Example usage
# matching_images = search_faces( face_to_find_key = 'sampleImages/mansOFF.jpg')

# print(matching_images)
