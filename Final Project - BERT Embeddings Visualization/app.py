import numpy as np
import torch
from transformers import BertTokenizer, BertModel
from flask import Flask, request, jsonify, render_template, make_response
import logging
import text_processing as tp

app = Flask(__name__)

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
# Load pre-trained model (weights)
model = BertModel.from_pretrained("bert-base-uncased",
                                  output_hidden_states = True, # Whether the model returns all hidden-states.
                                  )
# Put the model in "evaluation" mode, meaning feed-forward operation.
model.eval()


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict',methods=['POST'])
def predict():

    int_features = [int(x) for x in request.form.values()]
    final_features = [np.array(int_features)]
    prediction = model.predict(final_features)

    output = round(prediction[0], 2)

    return render_template('index.html', prediction_text='Sales should be $ {}'.format(output))

@app.route('/visualize',methods=['POST'])
def visualize():
    text = request.form.get("vis_text")
    print(text)
    embeddings_dict = tp.get_embeddings_forviz(model, tokenizer, text)
    #data = request.get_json(force=True)
    #prediction = model.predict([np.array(list(data.values()))])

    output = {"name": "fine"}
    resp = make_response(jsonify(embeddings_dict), 200)
    resp.headers['Content-Type'] = "application/json"

    return resp

if __name__ == "__main__":
    app.run(debug=True)