import json
import requests
from datetime import datetime
import os

def get_auth_token():
    token_url = 'http://localhost:8000/token'
    data = {
        'username': 'yash',
        'password': 'tLiktbti07!'
    }
    response = requests.post(token_url, data=data)
    response.raise_for_status()
    return response.json()['access_token']

def extract_metric(text, metric_name):
    # Simple extraction logic - adjust as needed
    start = text.find(f"{metric_name}:") + len(metric_name) + 1
    end = text.find("\n", start)
    value_str = text[start:end].strip()
    try:
        return int(value_str)
    except ValueError:
        print(f"Warning: Could not parse {metric_name} value: {value_str}")
        return 0

def process_superwhisper_output(json_file_path, auth_token):
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    
    # Assuming the JSON has a 'text' field with all the information
    full_text = data.get('text', '')
    
    entry = {
        "date": datetime.now().date().isoformat(),
        "time": datetime.now().time().isoformat(),
        "mood": extract_metric(full_text, "Mood"),
        "gym_performance": extract_metric(full_text, "Gym Performance"),
        "soreness": extract_metric(full_text, "Soreness"),
        "sleep_quality": extract_metric(full_text, "Sleep Quality"),
        "energy_levels": extract_metric(full_text, "Energy Levels"),
        "sex_drive": extract_metric(full_text, "Sex Drive"),
        "hunger_levels": extract_metric(full_text, "Hunger Levels"),
        "cravings": extract_metric(full_text, "Cravings"),
        "digestion": extract_metric(full_text, "Digestion"),
        "additional_notes": [note.strip() for note in full_text.split('\n') if note.strip().startswith('-')],
        "summary": full_text[:500]  # First 500 characters as summary
    }
    
    # Send the data to your API
    try:
        response = requests.post('http://localhost:8000/biofeedback', 
                                 json=entry, 
                                 headers={'Authorization': f'Bearer {auth_token}'})
        response.raise_for_status()
        print(f"Data successfully sent to API for {json_file_path}")
        print(f"Response: {response.json()}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending data for {json_file_path}: {e}")
        if hasattr(e, 'response'):
            print(f"Response content: {e.response.content}")

def process_directory(directory_path):
    try:
        auth_token = get_auth_token()
        print("Successfully obtained authentication token")
    except requests.exceptions.RequestException as e:
        print(f"Failed to obtain authentication token: {e}")
        return

    for filename in os.listdir(directory_path):
        if filename.endswith('.json'):
            file_path = os.path.join(directory_path, filename)
            process_superwhisper_output(file_path, auth_token)

if __name__ == "__main__":
    process_directory('sample_data')