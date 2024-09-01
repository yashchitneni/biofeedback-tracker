import json
import random
from datetime import datetime, timedelta

def generate_sample(date):
    return {
        "text": f"""Biofeedback Entry for {date.strftime('%Y-%m-%d')}

Mood: {random.randint(1, 5)}
Gym Performance: {random.randint(1, 5)}
Soreness: {random.randint(1, 5)}
Sleep Quality: {random.randint(1, 5)}
Energy Levels: {random.randint(1, 5)}
Sex Drive: {random.randint(1, 5)}
Hunger Levels: {random.randint(1, 5)}
Cravings: {random.randint(1, 5)}
Digestion: {random.randint(1, 5)}

Additional Notes:
- {random.choice(['Felt great', 'Felt tired', 'Felt stressed', 'Felt motivated'])}
- {random.choice(['Had a productive day', 'Struggled with focus', 'Enjoyed my meals', 'Had trouble sleeping'])}

{random.choice(['Overall, a good day.', 'Room for improvement tomorrow.', 'Feeling optimistic about progress.', 'Need to focus on better habits.'])}"""
    }

def generate_samples(num_samples):
    samples = []
    start_date = datetime.now().date()
    for i in range(num_samples):
        date = start_date - timedelta(days=i)
        samples.append(generate_sample(date))
    return samples

if __name__ == "__main__":
    num_samples = 30  # Generate 30 days of data
    samples = generate_samples(num_samples)
    for i, sample in enumerate(samples):
        with open(f'sample_output_{i+1}.json', 'w') as f:
            json.dump(sample, f, indent=2)
    print(f"Generated {num_samples} sample files.")