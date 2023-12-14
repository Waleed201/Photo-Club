from flask import Flask, request, render_template
import FR  # Import your face recognition script here

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')  # Render an HTML form for file upload

@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'No file part'
    file = request.files['file']
    # You might need to save this file temporarily or process it directly

    # Call your face recognition function here
    # For example, if your function is named 'search_faces'
    results = FR.search_faces()

    # Return the results or render another template with the results
    return render_template('results.html', results=results)

if __name__ == '__main__':
    app.run(debug=True)
