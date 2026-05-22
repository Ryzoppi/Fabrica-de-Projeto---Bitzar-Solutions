# Registra o modelo customizado no Ollama
# Execute uma vez após subir o container do Ollama

echo "Aguardando Ollama iniciar..."
until curl -s http://localhost:11434/api/tags > /dev/null; do
  sleep 2
done

echo "Baixando modelo base phi3:mini..."
ollama pull qwen2.5:1.5b

echo "Registrando modelo bitzar-rag..."
ollama create bitzar-rag -f ./Modelfile

echo "Testando modelo..."
ollama run bitzar-rag "Responda apenas: ok"

echo "Modelo pronto."