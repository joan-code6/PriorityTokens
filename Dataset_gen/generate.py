from openrouter import OpenRouter
import os
import dotenv

dotenv.load_dotenv()

if os.getenv("PROVIDER") == "hai":
    custom_provider="https://ai.hackclub.com/proxy/v1"
else:
    custom_provider="https://openrouter.ai/api/v1"
print(f"Using provider: {custom_provider}")
with OpenRouter(
    api_key=os.getenv("API_KEY"),
    server_url=custom_provider
) as client:
    print("Sending request...")
    response = client.chat.send(
        model="minimax/minimax-m2",
        reasoning=False,
        messages=[
            {"role": "system", "content": f"""
Hey I am Finetuning a AI Model and you have to help me.

My idea for the finetuning is to give the model 11 new tokens:
<<Priority1>>, <<Priority2>>, <<Priority3>>, <<Priority4>>, <<Priority5>>, <<Priority6>>, <<Priority7>>, <<Priority8>>, <<Priority9>>, <<Priority10>> and <<PriorityEnd>>

Based on the Priority Score (1 being the lowest meaning not important and 10 being REALLY important) the model should behave differently.

I need a dataset and you are gonna generate it.

{datagen_type_task_description}

{topic}

Only return the following json:

{datagen_type_task_json_output}



""" 
             },
        ]
    )

print("Response received:")

with open("response.txt", "w", encoding="utf-8") as file:
    file.write(str(response.choices[0].message.content))