# FR.py 

import boto3
import face_recognition
import io
from PIL import Image
from botocore.client import Config
from tkinter import filedialog
import io
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2



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

def preprocess_image(image):
    # Resize the image to match the input shape of the model
    return tf.image.resize(image, (224, 224))

def search_faces(folder_name, face_to_find_key, bucket_name='photo-club-s3'):
    # Download the reference image from S3
    file_stream = io.BytesIO()
    s3.download_fileobj(Bucket=bucket_name, Key=face_to_find_key, Fileobj=file_stream)
    file_stream.seek(0)
    known_image = face_recognition.load_image_file(file_stream)
    known_encoding = face_recognition.face_encodings(known_image)[0]

    # Load pre-trained MobileNetV2 model for few-shot learning
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    base_model.trainable = False


    # Add custom layers for face recognition
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dense(128, activation='relu'),
        layers.Dense(64, activation='relu'),
        layers.Dense(1, activation='sigmoid')  # Binary classification for face or not
    ])

    # Compile the model
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # Iterate over images in the specified folder and fine-tune the model
    obj_list = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)
    if 'Contents' not in obj_list:
        return []

    matching_faces = []
    for obj in obj_list['Contents']:
        # Download image from S3
        obj_key = obj['Key']
        file_stream = io.BytesIO()
        s3.download_fileobj(Bucket=bucket_name, Key=obj_key, Fileobj=file_stream)
        file_stream.seek(0)
        image = face_recognition.load_image_file(file_stream)

        # Extract face encoding from the image
        image_encoding = face_recognition.face_encodings(image)
        if not image_encoding:
            continue  # Skip if no face is found in the image

        # Fine-tune the model with the current image
        x = preprocess_image(image)
        x = tf.expand_dims(x, axis=0)
        y_train = 1 if obj_key == face_to_find_key else 0  # Positive example for the reference face
        y_train = tf.constant([[y_train]], dtype=tf.float32)  # Convert to tensor
        model.train_on_batch(x, y_train)

        # Evaluate the current image on the fine-tuned model
        x_eval = preprocess_image(image)
        x_eval = tf.expand_dims(x_eval, axis=0)
        prediction = model.predict(x_eval)

        # If the prediction is above a threshold, consider it a match
        print(obj_key, prediction)
        if prediction > 0.3:
            matching_faces.append(obj_key)

    return matching_faces
# Note: Ensure that the necessary imports, such as 's3', are defined before using this function.


# Note: Ensure that the necessary imports, such as 's3', are defined before using this function.

# Example usage
matching_images = search_faces(folder_name= 'sampleImages', face_to_find_key = 'sampleImages/Me.jpg')

print(matching_images)
