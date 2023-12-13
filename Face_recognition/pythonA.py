import boto3
import face_recognition
import io
from PIL import Image

# Initialize boto3 client
s3 = boto3.client('s3')

def search_faces(bucket, folder, face_to_find_path):
    # Load the image of the person to find
    known_image = face_recognition.load_image_file(face_to_find_path)
    known_encoding = face_recognition.face_encodings(known_image)[0]

    # List objects within a specified bucket
    obj_list = s3.list_objects_v2(Bucket=bucket, Prefix=folder)
    if 'Contents' not in obj_list:
        return []

    found_faces = []
    for obj in obj_list['Contents']:
        # Download image from S3
        file_stream = io.BytesIO()
        s3.download_fileobj(Bucket=bucket, Key=obj['Key'], Fileobj=file_stream)
        file_stream.seek(0)
        image = face_recognition.load_image_file(file_stream)

        # Find all faces in this image
        face_encodings = face_recognition.face_encodings(image)
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces([known_encoding], face_encoding)
            if matches[0]:
                found_faces.append(obj['Key'])
                break

    return found_faces

# Example usage
bucket_name = 'photo-club-s3'
folder_name = 'sampleImages'
face_image_path = 'sampleImages/Me.jpg'
matching_images = search_faces(bucket_name, folder_name, face_image_path)
print(matching_images)
