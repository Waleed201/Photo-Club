from flask import Flask, request, render_template,jsonify
import FR  
import os
app = Flask(__name__)

@app.route('/search', methods = ['POST']) 
def function():
    
    try:
        data = request.get_json(force =True)
        print("وصل يباشا"[::-1])
        print(data)
        
        results = FR.search_faces(folder_name = data['folder'],face_to_find_key= data['imgName'])
        print(results)
        return jsonify(results)
    except Exception as e:
        print(e)
        return "error"

port = int (os.environ.get("PORT",3000))
host = '0.0.0.0' if os.environ.get('FLASK_ENV') == 'production' else 'localhost'
if __name__ == '__main__':
    app.run(host=host, port=port, debug=True)
