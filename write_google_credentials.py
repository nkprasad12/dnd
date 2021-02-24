#!/bin/env python3
import os
from dotenv import load_dotenv

load_dotenv()

GOOGLE_KEY = os.environ.get('GOOGLE_KEY')
GOOGLE_APPLICATION_CREDENTIALS = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')

with open(GOOGLE_APPLICATION_CREDENTIALS, 'w') as f:
  f.write(GOOGLE_KEY)

print(f'Wrote credentials to {GOOGLE_APPLICATION_CREDENTIALS}')
