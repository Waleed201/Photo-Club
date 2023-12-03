import face_recognition
import cv2
import os

def find_matching_images(input_image_path, image_directory):
    # Load the input image and find face encodings
    input_image = face_recognition.load_image_file(input_image_path)
    input_face_encodings = face_recognition.face_encodings(input_image)

    if len(input_face_encodings) == 0:
        return "No faces found in the input image."

    input_face_encoding = input_face_encodings[0]

    matching_images = []

    # Loop through images in the directory
    for image_name in os.listdir(image_directory):
        # Load each image
        current_image_path = os.path.join(image_directory, image_name)
        current_image = face_recognition.load_image_file(current_image_path)
        current_face_encodings = face_recognition.face_encodings(current_image)

        for face_encoding in current_face_encodings:
            # Compare faces
            matches = face_recognition.compare_faces([input_face_encoding], face_encoding)
            if True in matches:
                matching_images.append(image_name)
                break

    return matching_images

# Example Usage
input_image = 'path/to/input/image.jpg'  # Replace with your input image path
image_folder = 'path/to/image/folder'    # Replace with your image folder path

matched_images = find_matching_images(input_image, image_folder)
print("Matching Images:", matched_images)
