import os
from dotenv import load_dotenv
load_dotenv(override=True)
print('Environment variables loaded:')
api_key = os.getenv('GHASEDAK_API_KEY')
if api_key:
    print('API Key:', api_key[:20] + '...')
else:
    print('API Key: Not found')
print('Proxy Format:', os.getenv('PROXY_FMT'))
print('USE_PROXY:', os.getenv('USE_PROXY'))
print('PROXY_POOL:', os.getenv('PROXY_POOL'))
