import requests
import json
import time

def gerar_configuracao_grafico(dados, labels, max_tentativas=3):
    url = "http://localhost:11434/api/generate"
    
    system_prompt = """Você é um Expert em Data Science e especialista na biblioteca front-end ApexCharts.
Sua única tarefa é receber metadados e retornar a configuração ideal de um gráfico em JSON.
REGRA ABSOLUTA: Retorne EXCLUSIVAMENTE um objeto JSON válido. Não inclua nenhuma explicação."""

    user_prompt = f"Gere a configuração do ApexCharts para os seguintes rótulos: {labels} e os respectivos valores: {dados}."

    payload = {
        "model": "llama3",
        "system": system_prompt,
        "prompt": user_prompt,
        "stream": False,
        "format": "json" 
    }

    
    for tentativa in range(1, max_tentativas + 1):
        print(f"Iniciando tentativa {tentativa} de {max_tentativas}...")
        
        try:
            response = requests.post(url, json=payload)
            resposta_bruta = response.json().get('response', '')
            
           
            json_valido = json.loads(resposta_bruta)
            
            print("✅ Sucesso! JSON validado com perfeição.")
            return json_valido
            
        except json.JSONDecodeError:
            
            print("⚠️ A IA gerou um JSON quebrado. Pedindo para refazer...")
            time.sleep(1) 
            
        except Exception as e:
            print(f"❌ Erro grave de conexão: {e}")
            break 
    return {"erro": "Não foi possível gerar o gráfico após várias tentativas."}


meus_labels = "['Janeiro', 'Fevereiro', 'Março']"
meus_dados = "[150, 300, 250]"

resultado_final = gerar_configuracao_grafico(meus_dados, meus_labels)

print("\n=== DADO PRONTO PARA ENVIAR PRO FRONT-END ===")
print(resultado_final)