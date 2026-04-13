import requests
import time

url = "http://localhost:11434/api/generate"
payload = {
    "model": "llama3",
    "prompt": "Gere um JSON simulando a configuração de um gráfico de barras simples com 3 categorias. Retorne apenas o JSON.",
    "stream": False 
}

print("A enviar requisição para o Ollama local...")
start_time = time.time()

try:
    response = requests.post(url, json=payload)
    end_time = time.time()
    
    tempo_total = end_time - start_time
    
    print(f"\nTempo de resposta: {tempo_total:.2f} segundos")
    print(f"Resposta da IA:\n{response.json().get('response')}")
    
except Exception as e:
    print(f"Erro ao conectar com o Ollama: {e}")