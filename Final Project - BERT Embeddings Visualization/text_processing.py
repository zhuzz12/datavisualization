import torch
import re
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np
import nltk
from nltk.corpus import stopwords



def tokenize_text(tokenizer, sentence):
	tokenized_sentence = tokenizer.tokenize(sentence)
	tokenized_res = tokenizer([sentence])

	indexed_tokens = tokenized_res['input_ids']
	segments_ids = tokenized_res['attention_mask']

	print(indexed_tokens)

	tokens_tensor = torch.tensor(indexed_tokens)
	segments_tensors = torch.tensor(segments_ids)

	return tokenized_sentence, tokens_tensor, segments_tensors



def get_bert_embeddings(tokens_tensor, segments_tensors, model): 
		with torch.no_grad():
			outputs = model(tokens_tensor, segments_tensors)
			hidden_states = outputs[2]

		# Getting embeddings from the final layer
		token_embeddings = hidden_states[-1]
		token_embeddings = torch.squeeze(token_embeddings, dim=0)

		return token_embeddings



def transform_embeddings_2d(embeddings):
	embeddings_scaled = StandardScaler().fit_transform(embeddings)
	print("scaled: ", embeddings_scaled.shape)
	pca = PCA(n_components = 2)
	transformed_embeddings = pca.fit_transform(embeddings_scaled)
	print("pca: ", transformed_embeddings.shape)

	return transformed_embeddings



def get_embeddings(model, tokenizer, text):

	dict_words= {"word": [], "context": [], "embedding": [], 'transformed_embedding': [], 'similarity':[]}
	
	sentences = re.split(r' *[\.\?!][\'"\)\]]* *', text)
	print(sentences)

	# stopwords to filter out from the text 
	stops =  set(stopwords.words('english'))


	for sentence in sentences:
		tokenized_sentence, tokens_tensor, segments_tensors = tokenize_text(tokenizer, sentence)
		token_embeddings = get_bert_embeddings(tokens_tensor, segments_tensors, model)

		for (token, token_embedding) in zip(tokenized_sentence, token_embeddings): 
			if (token in [".", ",", "/", "?", "!", ";", "(", ")", "a", "[CLS]", "[SEP]", "—", "'", "\"", "[", "]", "-"]):
				continue
			elif (token in stops):
				continue
			print(token)
			dict_words['word'].append(token)
			dict_words['context'].append(sentence)
			dict_words['embedding'].append(token_embedding.tolist())

	embeddings = np.array(dict_words['embedding'])
	transformed_embeddings = transform_embeddings_2d(embeddings)
	print(transformed_embeddings)

	for transformed_embedding in transformed_embeddings: 
		dict_words['transformed_embedding'].append(transformed_embedding.tolist())

	# calculate cosine similarity between word vectors
	words = dict_words['word']
	token_embeddings = torch.tensor(dict_words['embedding'])

	for (token, token_embedding) in zip(words, token_embeddings):
		token_embedding = torch.unsqueeze(token_embedding, 0)

		similarities = torch.cosine_similarity(token_embedding, token_embeddings)
		
		top_similarities, indices = torch.topk(similarities, 6)
		top_similarities = top_similarities[1:]
		
		top_words = [words[index] for index in indices[1:]]

		dict_words['similarity'].append({'sim_word': top_words, 'cos_similarity': top_similarities.tolist()})
		
	

	return dict_words



def get_embeddings_forviz(model, tokenizer, text): 

	dict_words = get_embeddings(model, tokenizer, text)

	# Prepare words and pca components of embeddings vectors 
	# to pass to js for visualization

	dict_words_forviz = []
	for (word, context, coords, similarity) in zip(dict_words['word'], dict_words['context'], dict_words['transformed_embedding'], dict_words['similarity']):
		top_similarities = []
		i = 0.5
		for (sim_word, cos_similarity) in zip(similarity['sim_word'], similarity['cos_similarity']):
			top_similarities.append({'sim_word': sim_word, 'cos_similarity': cos_similarity, 'order': i})
			i += 1
		dict_words_forviz.append({"word": word, "context": context, "x": coords[0], "y": coords[1], "similarity": top_similarities})

	print(dict_words_forviz)
	return dict_words_forviz
